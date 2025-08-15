import React, { useState, useCallback, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { GanttTask, BacklogStatus } from '../types/backlog';
import { useGanttChart } from '../hooks/useGanttChart';
import { useRenderTime, useThrottle } from '../hooks/usePerformance';
import { TaskModal } from './TaskModal';
import { GanttHeader } from './GanttHeader';
import { TaskBar } from './TaskBar';
import TaskActions from './TaskActions';
import { formatDate, getStatusColor, isTaskOverdue } from '../utils/ganttUtils';
import { TIMING, MESSAGES, CSS_CLASSES } from '../constants/app';

interface GanttChartProps {
  tasks: GanttTask[];
  selectedUsers: string[];
  selectedProjects: string[];
  startDate: Date;
  spaceId: string;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  projectStatuses: Map<number, BacklogStatus[]>;
  resolutions: {id: number, name: string}[];
}

export interface GanttChartRef {
  getFilteredTasks: () => GanttTask[];
}


const GanttChart = React.memo(forwardRef<GanttChartRef, GanttChartProps>(({ tasks, selectedUsers, selectedProjects, startDate, spaceId, onTaskUpdate, projectStatuses, resolutions }, ref) => {
  // パフォーマンス監視は必要な時のみ有効化
  // useRenderTime('GanttChart', { enabled: false, threshold: 200 });
  
  const [notification, setNotification] = useState<string | null>(null);
  const [showActionsForTask, setShowActionsForTask] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState({
    project: 70,
    task: 200,
    assignee: 90,
    startDate: 80,
    endDate: 80,
    status: 90
  });
  
  const {
    modal,
    dragState,
    editState,
    sortState,
    containerRef,
    handleRowClick,
    handleOutsideClick,
    handleCloseModal,
    handleEditClick,
    handleSaveEdit,
    handleCancelEdit,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleSort,
    availableAssignees,
    availablePriorities,
    getAvailableStatuses,
    filteredTasks,
    dateRange,
    days,
    chartWidth,
    setEditState
  } = useGanttChart({
    tasks,
    selectedUsers,
    selectedProjects,
    startDate,
    onTaskUpdate,
    projectStatuses,
    columnWidths
  });

  const handleCopySuccess = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), TIMING.NOTIFICATION_DISPLAY_DURATION);
  }, []);

  const handleColumnResize = useThrottle(useCallback((columnKey: string, width: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [columnKey]: width
    }));
  }, []), 16); // 60fps制限

  const handleTaskNameClick = useCallback((taskId: string) => {
    setShowActionsForTask(prev => prev === taskId ? null : taskId);
  }, []);

  // 外部から filteredTasks を取得できるようにする
  useImperativeHandle(ref, () => ({
    getFilteredTasks: () => filteredTasks
  }), [filteredTasks]);

  // 表示されるタスクのみをメモ化
  const visibleTasks = useMemo(() => {
    return filteredTasks.slice(0, 100); // 初期表示は100件まで
  }, [filteredTasks]);



  if (filteredTasks.length === 0) {
    return (
      <div className="gantt-empty">
        <p>{MESSAGES.NO_TASKS_TO_DISPLAY}</p>
      </div>
    );
  }


  return (
    <div 
      ref={containerRef}
      className={`gantt-chart ${dragState.isDragging ? 'dragging' : ''}`}
      onClick={handleOutsideClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <GanttHeader
        chartWidth={chartWidth}
        days={days}
        sortColumn={sortState.sortColumn}
        sortDirection={sortState.sortDirection}
        onSort={handleSort}
        columnWidths={columnWidths}
        onColumnResize={handleColumnResize}
      />
      
      <div className="gantt-body" style={{ minWidth: `${chartWidth}px` }}>
        {visibleTasks.map((task) => (
          <div 
            key={task.id} 
            className="gantt-row" 
            style={{ minWidth: `${chartWidth}px` }}
          >
            <div className="gantt-row-left">
              <div className="row-cell" style={{ width: `${columnWidths.project}px` }}>
                <span className="project-badge">{task.projectKey}</span>
              </div>
              <div 
                className={`row-cell task-name ${showActionsForTask === task.id ? 'show-actions' : ''}`} 
                style={{ width: `${columnWidths.task}px` }}
                onClick={() => handleTaskNameClick(task.id)}
              >
                <span className={`issue-key ${isTaskOverdue(task) ? 'overdue-text' : ''}`}>[{task.issueKey}]</span>
                <span className={`task-summary ${isTaskOverdue(task) ? 'overdue-text' : ''}`}>{task.name}</span>
                <TaskActions
                  task={task}
                  spaceId={spaceId}
                  onCopySuccess={handleCopySuccess}
                  onShowModal={handleRowClick}
                />
              </div>
              <div className="row-cell" style={{ width: `${columnWidths.assignee}px` }}>{task.assignee}</div>
              <div className="row-cell date-cell" style={{ width: `${columnWidths.startDate}px` }}>{formatDate(task.startDate)}</div>
              <div className="row-cell date-cell" style={{ width: `${columnWidths.endDate}px` }}>{formatDate(task.endDate)}</div>
              <div className="row-cell" style={{ width: `${columnWidths.status}px` }}>
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
                <TaskBar
                  task={task}
                  days={days}
                  dateRange={dateRange}
                  startDate={startDate}
                  onTaskClick={handleRowClick}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <TaskModal
        task={modal.task}
        show={modal.show}
        editMode={editState.editMode}
        editForm={editState.editForm}
        availableAssignees={availableAssignees}
        availablePriorities={availablePriorities}
        getAvailableStatuses={getAvailableStatuses}
        resolutions={resolutions}
        onClose={handleCloseModal}
        onEdit={handleEditClick}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        onFormChange={(updates) => setEditState(prev => ({ ...prev, editForm: { ...prev.editForm, ...updates } }))}
      />
      
      {notification && (
        <div className={CSS_CLASSES.COPY_NOTIFICATION}>
          {notification}
        </div>
      )}
    </div>
  );
}));

GanttChart.displayName = 'GanttChart';

export default GanttChart;