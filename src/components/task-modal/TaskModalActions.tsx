import React from 'react';
import { Edit2, Save, XCircle } from 'lucide-react';

interface TaskModalActionsProps {
  editMode: boolean;
  onEdit: (e: React.MouseEvent) => void;
  onSave: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
}

export const TaskModalActions: React.FC<TaskModalActionsProps> = ({
  editMode,
  onEdit,
  onSave,
  onCancel
}) => {
  return (
    <div className="modal-actions">
      {!editMode ? (
        <button className="modal-btn modal-btn-primary" onClick={onEdit}>
          <Edit2 size={16} />
          編集
        </button>
      ) : (
        <>
          <button className="modal-btn modal-btn-success" onClick={onSave}>
            <Save size={16} />
            保存
          </button>
          <button className="modal-btn modal-btn-secondary" onClick={onCancel}>
            <XCircle size={16} />
            キャンセル
          </button>
        </>
      )}
    </div>
  );
};