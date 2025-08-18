import React from 'react';
import { X, Edit2, Save, XCircle } from 'lucide-react';
import { GanttTask } from '../types/backlog';
import { formatDate } from '../utils/ganttUtils';

interface TaskModalProps {
  task: GanttTask | null;
  show: boolean;
  editMode: boolean;
  editForm: Partial<GanttTask>;
  availableAssignees: string[];
  availablePriorities: string[];
  getAvailableStatuses: (task: GanttTask) => string[];
  resolutions: { id: number; name: string }[];
  onClose: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onSave: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
  onFormChange: (updates: Partial<GanttTask>) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  show,
  editMode,
  editForm,
  availableAssignees,
  availablePriorities,
  getAvailableStatuses,
  resolutions,
  onClose,
  onEdit,
  onSave,
  onCancel,
  onFormChange
}) => {
  if (!show || !task) return null;

  const handleFormChange = (field: keyof GanttTask, value: any) => {
    onFormChange({ [field]: value });
  };

  return (
    <>
      <div className="gantt-modal-overlay" onClick={onClose} />
      <div 
        className="gantt-modal show"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            [{task.issueKey}] {task.name}
          </div>
          <div className="modal-actions">
            <button 
              className="modal-close-btn"
              onClick={onClose}
              aria-label="閉じる"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        <div className="modal-content">
          <div className="modal-row">
            <div className="modal-label">プロジェクト:</div>
            <div className="modal-value">{task.projectKey}</div>
          </div>
          
          <div className="modal-row">
            <div className="modal-label">担当者:</div>
            <div className="modal-value">
              {editMode ? (
                <select
                  value={editForm.assignee || ''}
                  onChange={(e) => handleFormChange('assignee', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  className="modal-select"
                >
                  {availableAssignees.map(assignee => (
                    <option key={assignee} value={assignee}>{assignee}</option>
                  ))}
                </select>
              ) : (
                task.assignee
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
                  onChange={(e) => handleFormChange('startDate', e.target.value ? new Date(e.target.value) : null)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  className="modal-input"
                />
              ) : (
                formatDate(task.startDate)
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
                  onChange={(e) => handleFormChange('endDate', e.target.value ? new Date(e.target.value) : null)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  className="modal-input"
                />
              ) : (
                formatDate(task.endDate)
              )}
            </div>
          </div>
          
          <div className="modal-row">
            <div className="modal-label">優先度:</div>
            <div className="modal-value">
              {editMode ? (
                <select
                  value={editForm.priority || ''}
                  onChange={(e) => handleFormChange('priority', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  className="modal-select"
                >
                  {availablePriorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              ) : (
                task.priority
              )}
            </div>
          </div>
          
          <div className="modal-row">
            <div className="modal-label">ステータス:</div>
            <div className="modal-value">
              {editMode ? (
                <select
                  value={editForm.status || ''}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  className="modal-select"
                >
                  {getAvailableStatuses(task).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              ) : (
                task.status
              )}
            </div>
          </div>
          
          <div className="modal-row">
            <div className="modal-label">完了理由:</div>
            <div className="modal-value">
              {editMode ? (
                <select
                  value={editForm.resolution || ''}
                  onChange={(e) => handleFormChange('resolution', e.target.value)}
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
                task.resolution || '未設定'
              )}
            </div>
          </div>
          
          {editMode && (
            <div className="modal-row">
              <div className="modal-label">コメント:</div>
              <div className="modal-value">
                <textarea
                  value={editForm.comment || ''}
                  onChange={(e) => handleFormChange('comment', e.target.value)}
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
              <button className="modal-save-btn" onClick={onSave}>
                <Save size={16} />
                保存
              </button>
              <button className="modal-cancel-btn" onClick={onCancel}>
                <XCircle size={16} />
                キャンセル
              </button>
            </div>
          ) : (
            <div className="modal-buttons">
              <button className="modal-edit-main-btn" onClick={onEdit}>
                <Edit2 size={16} />
                編集する
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};