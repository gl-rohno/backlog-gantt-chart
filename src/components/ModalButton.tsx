import React, { useCallback } from 'react';
import { Eye } from 'lucide-react';
import { GanttTask } from '../types/backlog';
import { BUTTON_LABELS, UI, CSS_CLASSES } from '../constants/app';

interface ModalButtonProps {
  task: GanttTask;
  onShowModal: (e: React.MouseEvent, task: GanttTask) => void;
  className?: string;
}

const ModalButton: React.FC<ModalButtonProps> = ({ 
  task, 
  onShowModal, 
  className = '' 
}) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onShowModal(e, task);
  }, [onShowModal, task]);

  return (
    <button
      className={`${CSS_CLASSES.MODAL_BUTTON} ${className}`}
      onClick={handleClick}
      title={BUTTON_LABELS.SHOW_DETAILS}
      type="button"
      aria-label={`${task.issueKey} の${BUTTON_LABELS.SHOW_DETAILS}`}
    >
      <Eye size={UI.ICON_SIZE} />
    </button>
  );
};

export default ModalButton;