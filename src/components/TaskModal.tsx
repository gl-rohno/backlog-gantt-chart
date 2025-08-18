import React from 'react';
import { GanttTask } from '../types/backlog';
import { Modal } from './common/Modal';
import { FormField } from './common/FormField';
import { TaskModalHeader } from './task-modal/TaskModalHeader';
import { TaskModalActions } from './task-modal/TaskModalActions';
import { TaskSelectField } from './task-modal/form-fields/TaskSelectField';
import { TaskDateField } from './task-modal/form-fields/TaskDateField';
import { TaskTextareaField } from './task-modal/form-fields/TaskTextareaField';
import { useTaskForm } from '../hooks/useTaskForm';

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
  const { handleFormChange } = useTaskForm(onFormChange);

  if (!task) return null;

  const currentData = editMode ? { ...task, ...editForm } : task;
  const availableStatuses = getAvailableStatuses(task);

  return (
    <Modal show={show} onClose={onClose}>
      <TaskModalHeader
        issueKey={task.issueKey}
        title={task.name}
        onClose={onClose}
      />

      <div className="modal-content">
        <FormField label="プロジェクト">
          <span className="project-badge">{task.projectKey}</span>
        </FormField>

        <FormField label="担当者">
          <TaskSelectField
            value={currentData.assignee || ''}
            options={availableAssignees}
            isEditing={editMode}
            onChange={(value) => handleFormChange('assignee', value)}
            placeholder="担当者を選択"
          />
        </FormField>

        <FormField label="開始日">
          <TaskDateField
            value={currentData.startDate || null}
            isEditing={editMode}
            onChange={(value) => handleFormChange('startDate', value)}
          />
        </FormField>

        <FormField label="期限日">
          <TaskDateField
            value={currentData.endDate || null}
            isEditing={editMode}
            onChange={(value) => handleFormChange('endDate', value)}
          />
        </FormField>

        <FormField label="優先度">
          <TaskSelectField
            value={currentData.priority || ''}
            options={availablePriorities}
            isEditing={editMode}
            onChange={(value) => handleFormChange('priority', value)}
            placeholder="優先度を選択"
          />
        </FormField>

        <FormField label="ステータス">
          <TaskSelectField
            value={currentData.status || ''}
            options={availableStatuses}
            isEditing={editMode}
            onChange={(value) => handleFormChange('status', value)}
            placeholder="ステータスを選択"
          />
        </FormField>

        <FormField label="完了理由">
          <TaskSelectField
            value={currentData.resolution || ''}
            options={resolutions.map(r => r.name)}
            isEditing={editMode}
            onChange={(value) => handleFormChange('resolution', value)}
            placeholder="完了理由を選択"
          />
        </FormField>

        {editMode && (
          <FormField label="コメント">
            <TaskTextareaField
              value={currentData.comment || ''}
              isEditing={true}
              onChange={(value) => handleFormChange('comment', value)}
              placeholder="更新内容のコメントを入力..."
              rows={3}
            />
          </FormField>
        )}
      </div>

      <TaskModalActions
        editMode={editMode}
        onEdit={onEdit}
        onSave={onSave}
        onCancel={onCancel}
      />
    </Modal>
  );
};