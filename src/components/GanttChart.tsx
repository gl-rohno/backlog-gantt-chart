import React, { useMemo, useState, useRef } from 'react';
import { format, eachDayOfInterval, isSameDay, addMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { X, Edit2, Save, XCircle } from 'lucide-react';
import { GanttTask, BacklogStatus } from '../types/backlog';

interface GanttChartProps {
  tasks: GanttTask[];
  selectedUsers: string[];
  selectedProjects: string[];
  startDate: Date;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  projectStatuses: Map<number, BacklogStatus[]>;
  resolutions: {id: number, name: string}[];
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, selectedUsers, selectedProjects, startDate, onTaskUpdate, projectStatuses, resolutions }) => {
  const [modal, setModal] = useState<{
    show: boolean;
    task: GanttTask | null;
  }>({ show: false, task: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<GanttTask>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRowClick = (event: React.MouseEvent, task: GanttTask) => {
    event.stopPropagation();
    setModal({
      show: true,
      task: task
    });
  };

  const handleOutsideClick = () => {
    setModal({ show: false, task: null });
    setEditMode(false);
    setEditForm({});
  };

  const handleCloseModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModal({ show: false, task: null });
    setEditMode(false);
    setEditForm({});
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (modal.task) {
      setEditMode(true);
      setEditForm({
        assignee: modal.task.assignee,
        startDate: modal.task.startDate,
        endDate: modal.task.endDate,
        priority: modal.task.priority,
        status: modal.task.status,
        resolution: modal.task.resolution || '',
        comment: modal.task.comment || ''
      });
    }
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (modal.task && onTaskUpdate) {
      onTaskUpdate(modal.task.id, editForm);
    }
    setEditMode(false);
    setModal({ show: false, task: null });
    setEditForm({});
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditMode(false);
    setEditForm({});
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Skip drag for clickable elements and form inputs
    if (
      e.target instanceof HTMLElement &&
      (e.target.classList.contains('task-name') ||
       e.target.closest('.task-name') ||
       e.target.classList.contains('gantt-bar') ||
       e.target.closest('.gantt-bar') ||
       e.target.classList.contains('gantt-modal') ||
       e.target.closest('.gantt-modal') ||
       e.target.tagName === 'INPUT' ||
       e.target.tagName === 'SELECT' ||
       e.target.tagName === 'TEXTAREA' ||
       e.target.tagName === 'BUTTON')
    ) {
      return;
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    if (containerRef.current) {
      setScrollStart({
        x: containerRef.current.scrollLeft,
        y: containerRef.current.scrollTop
      });
    }

    // Change cursor to grabbing
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }

    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const deltaX = dragStart.x - e.clientX;
    const deltaY = dragStart.y - e.clientY;

    containerRef.current.scrollLeft = scrollStart.x + deltaX;
    containerRef.current.scrollTop = scrollStart.y + deltaY;

    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    
    // Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '未設定';
    return format(date, 'yyyy/MM/dd', { locale: ja });
  };


  // 編集で使用する選択肢を取得
  const { availableAssignees, availablePriorities } = useMemo(() => {
    const assignees = Array.from(new Set(tasks.map(task => task.assignee))).sort();
    
    // 優先度をdisplayOrderでソート（idが小さいほど高優先度）
    const priorityMap = new Map<string, number>();
    tasks.forEach(task => {
      if (task.priorityDisplayOrder !== undefined) {
        priorityMap.set(task.priority, task.priorityDisplayOrder);
      }
    });
    const uniquePriorities = Array.from(new Set(tasks.map(task => task.priority)));
    const sortedPriorities = uniquePriorities.sort((a, b) => {
      const orderA = priorityMap.get(a) ?? 999;
      const orderB = priorityMap.get(b) ?? 999;
      return orderA - orderB;
    });
    
    return {
      availableAssignees: assignees,
      availablePriorities: sortedPriorities
    };
  }, [tasks]);

  // 現在編集中のタスクのプロジェクト固有ステータスを取得
  const getAvailableStatuses = (task: GanttTask) => {
    const statuses = projectStatuses.get(task.projectId);
    if (!statuses) return [];
    
    return statuses
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(status => status.name);
  };

  const filteredTasks = useMemo(() => {
    // どちらかのフィルターが空の場合は何も表示しない
    if (selectedUsers.length === 0 || selectedProjects.length === 0) {
      return [];
    }
    
    const filtered = tasks.filter(task => {
      const userMatch = selectedUsers.includes(task.assignee);
      const projectMatch = selectedProjects.includes(task.projectKey);
      
      // 期限が表示開始日より前で「完了」ステータスのタスクは除外（日付が設定されている場合のみ）
      const isCompleted = task.status === '完了';
      const isEndBeforeStart = task.endDate && task.endDate < startDate;
      
      if (isCompleted && isEndBeforeStart) {
        return false;
      }
      
      // 期限日が未設定で「完了」ステータスのタスクは除外
      if (isCompleted && !task.endDate) {
        return false;
      }
      
      return userMatch && projectMatch;
    });

    // 開始日昇順でソート（開始日未設定の場合は最後に配置）
    const sorted = [...filtered].sort((a, b) => {
      if (!a.startDate && !b.startDate) return 0;
      if (!a.startDate) return 1;
      if (!b.startDate) return -1;
      return a.startDate.getTime() - b.startDate.getTime();
    });

    return sorted;
  }, [tasks, selectedUsers, selectedProjects, startDate]);

  const dateRange = useMemo(() => {
    // 表示開始日から3ヶ月間を表示
    const endDate = addMonths(startDate, 3);
    
    return {
      start: startDate,
      end: endDate
    };
  }, [startDate]);

  const days = useMemo(() => {
    return eachDayOfInterval(dateRange);
  }, [dateRange]);


  if (filteredTasks.length === 0) {
    return (
      <div className="gantt-empty">
        <p>表示するタスクがありません</p>
      </div>
    );
  }

  const getTaskStyle = (task: GanttTask) => {
    if (!dateRange || !task.startDate || !task.endDate) return { display: 'none' };
    
    const totalDays = days.length;
    const startIndex = days.findIndex(day => isSameDay(day, task.startDate!));
    const endIndex = days.findIndex(day => isSameDay(day, task.endDate!));
    
    const left = (startIndex / totalDays) * 100;
    const width = ((endIndex - startIndex + 1) / totalDays) * 100;
    
    return {
      left: `${left}%`,
      width: `${width}%`
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '最高': return '#e53e3e';
      case '高': return '#fd7f28';
      case '中': return '#3182ce';
      case '低': return '#38a169';
      default: return '#718096';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '完了':
      case 'Closed':
        return '#38a169';
      case '処理中':
      case 'In Progress':
        return '#3182ce';
      case '未対応':
      case 'Open':
        return '#718096';
      default:
        return '#718096';
    }
  };

  const getTaskBarColor = (task: GanttTask) => {
    // 期限切れかつ未完了の場合は赤色で強調（日付が設定されている場合のみ）
    const isOverdue = task.endDate && task.endDate < new Date() && task.status !== '完了' && task.status !== 'Closed';
    if (isOverdue) {
      return '#e53e3e'; // 赤色
    }
    return getStatusColor(task.status);
  };

  const chartWidth = 700 + (days.length * 40); // 左側700px(280+120+100+80+120) + 各日40px

  return (
    <div 
      ref={containerRef}
      className="gantt-chart" 
      onClick={handleOutsideClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'grab' }}
    >
      <div className="gantt-header" style={{ minWidth: `${chartWidth}px` }}>
        <div className="gantt-header-left">
          <div className="header-cell">
            タスク
          </div>
          <div className="header-cell">
            担当者
          </div>
          <div className="header-cell">
            プロジェクト
          </div>
          <div className="header-cell">
            優先度
          </div>
          <div className="header-cell">
            ステータス
          </div>
        </div>
        <div className="gantt-header-right">
          <div className="gantt-timeline">
            {days.map((day, index) => (
              <div key={index} className="timeline-cell">
                <div className="timeline-date">
                  {format(day, 'd', { locale: ja })}
                </div>
                <div className="timeline-month">
                  {format(day, 'MMM', { locale: ja })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="gantt-body" style={{ minWidth: `${chartWidth}px` }}>
        {filteredTasks.map((task) => (
          <div 
            key={task.id} 
            className="gantt-row" 
            style={{ minWidth: `${chartWidth}px` }}
          >
            <div className="gantt-row-left">
              <div 
                className="row-cell task-name" 
                style={{ cursor: 'pointer' }}
                onClick={(e) => handleRowClick(e, task)}
              >
                <span className="issue-key">[{task.issueKey}]</span>
                <span className="task-summary">{task.name}</span>
              </div>
              <div className="row-cell">{task.assignee}</div>
              <div className="row-cell">
                <span className="project-badge">{task.projectKey}</span>
              </div>
              <div className="row-cell">
                <span 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                >
                  {task.priority}
                </span>
              </div>
              <div className="row-cell">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(task.status) }}
                >
                  {task.status || 'No Status'}
                </span>
              </div>
            </div>
            <div className="gantt-row-right">
              <div className="gantt-timeline-row">
                <div 
                  className="gantt-bar"
                  style={{
                    ...getTaskStyle(task),
                    backgroundColor: getTaskBarColor(task),
                    cursor: getTaskStyle(task).display === 'none' ? 'default' : 'pointer'
                  }}
                  title={`${task.name} (${task.status})`}
                  onClick={(e) => {
                    if (getTaskStyle(task).display !== 'none') {
                      handleRowClick(e, task);
                    }
                  }}
                >
                  <div 
                    className="gantt-bar-progress"
                    style={{ width: `${task.progress}%` }}
                  />
                  <span className="gantt-bar-text">
                    {task.progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* モーダル */}
      {modal.show && modal.task && (
        <>
          <div className="gantt-modal-overlay" onClick={handleCloseModal} />
          <div 
            className="gantt-modal show"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                [{modal.task.issueKey}] {modal.task.name}
              </div>
              <div className="modal-actions">
                <button 
                  className="modal-close-btn"
                  onClick={handleCloseModal}
                  aria-label="閉じる"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="modal-content">
            <div className="modal-row">
              <div className="modal-label">プロジェクト:</div>
              <div className="modal-value">{modal.task.projectKey}</div>
            </div>
            <div className="modal-row">
              <div className="modal-label">担当者:</div>
              <div className="modal-value">
                {editMode ? (
                  <select
                    value={editForm.assignee || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, assignee: e.target.value }))}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="modal-select"
                  >
                    {availableAssignees.map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                ) : (
                  modal.task.assignee
                )}
              </div>
            </div>
            <div className="modal-row">
              <div className="modal-label">開始日:</div>
              <div className="modal-value">
                {editMode ? (
                  <input
                    type="date"
                    value={editForm.startDate ? editForm.startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      startDate: e.target.value ? new Date(e.target.value) : null 
                    }))}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="modal-input"
                  />
                ) : (
                  formatDate(modal.task.startDate)
                )}
              </div>
            </div>
            <div className="modal-row">
              <div className="modal-label">期限日:</div>
              <div className="modal-value">
                {editMode ? (
                  <input
                    type="date"
                    value={editForm.endDate ? editForm.endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      endDate: e.target.value ? new Date(e.target.value) : null 
                    }))}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="modal-input"
                  />
                ) : (
                  formatDate(modal.task.endDate)
                )}
              </div>
            </div>
            <div className="modal-row">
              <div className="modal-label">優先度:</div>
              <div className="modal-value">
                {editMode ? (
                  <select
                    value={editForm.priority || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="modal-select"
                  >
                    {availablePriorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                ) : (
                  modal.task.priority
                )}
              </div>
            </div>
            <div className="modal-row">
              <div className="modal-label">ステータス:</div>
              <div className="modal-value">
                {editMode ? (
                  <select
                    value={editForm.status || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="modal-select"
                  >
                    {getAvailableStatuses(modal.task).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                ) : (
                  modal.task.status
                )}
              </div>
            </div>
            <div className="modal-row">
              <div className="modal-label">完了理由:</div>
              <div className="modal-value">
                {editMode ? (
                  <select
                    value={editForm.resolution || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, resolution: e.target.value }))}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="modal-select"
                  >
                    <option value="">未設定</option>
                    {resolutions.map(resolution => (
                      <option key={resolution.id} value={resolution.name}>{resolution.name}</option>
                    ))}
                  </select>
                ) : (
                  modal.task.resolution || '未設定'
                )}
              </div>
            </div>
            {editMode && (
              <div className="modal-row">
                <div className="modal-label">コメント:</div>
                <div className="modal-value">
                  <textarea
                    value={editForm.comment || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="modal-textarea"
                    placeholder="コメントを入力..."
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            {editMode ? (
              <div className="modal-buttons">
                <button 
                  className="modal-save-btn"
                  onClick={handleSaveEdit}
                >
                  <Save size={16} />
                  保存
                </button>
                <button 
                  className="modal-cancel-btn"
                  onClick={handleCancelEdit}
                >
                  <XCircle size={16} />
                  キャンセル
                </button>
              </div>
            ) : (
              <div className="modal-buttons">
                <button 
                  className="modal-edit-main-btn"
                  onClick={handleEditClick}
                >
                  <Edit2 size={16} />
                  編集する
                </button>
              </div>
            )}
          </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GanttChart;