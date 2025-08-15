import React from 'react';
import CopyButton from './CopyButton';
import ModalButton from './ModalButton';
import LinkButton from './LinkButton';
import { GanttTask } from '../types/backlog';
import { CSS_CLASSES } from '../constants/app';

interface TaskActionsProps {
  task: GanttTask;
  spaceId: string;
  onCopySuccess: (message: string) => void;
  onShowModal: (e: React.MouseEvent, task: GanttTask) => void;
}

const TaskActions: React.FC<TaskActionsProps> = ({
  task,
  spaceId,
  onCopySuccess,
  onShowModal
}) => {
  return (
    <div className={CSS_CLASSES.TASK_ACTIONS}>
      <CopyButton 
        issueKey={task.issueKey}
        taskName={task.name}
        onCopySuccess={onCopySuccess}
        className="task-copy-btn"
      />
      <ModalButton 
        task={task}
        onShowModal={onShowModal}
        className="task-modal-btn"
      />
      <LinkButton 
        task={task}
        spaceId={spaceId}
        className="task-link-btn"
      />
    </div>
  );
};

export default TaskActions;