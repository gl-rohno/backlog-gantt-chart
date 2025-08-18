import React from 'react';
import { X } from 'lucide-react';

interface TaskModalHeaderProps {
  issueKey: string;
  title: string;
  onClose: (e: React.MouseEvent) => void;
}

export const TaskModalHeader: React.FC<TaskModalHeaderProps> = ({
  issueKey,
  title,
  onClose
}) => {
  return (
    <div className="modal-header">
      <div className="modal-title">
        <span className="issue-key-badge">[{issueKey}]</span>
        <span>{title}</span>
      </div>
      <button className="modal-close" onClick={onClose}>
        <X size={20} />
      </button>
    </div>
  );
};