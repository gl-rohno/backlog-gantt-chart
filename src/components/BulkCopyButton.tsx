import React from 'react';
import { Copy, Check } from 'lucide-react';
import { GanttTask } from '../types/backlog';
import { MESSAGES, UI, BUTTON_LABELS } from '../constants/app';
import { useClipboard } from '../hooks/useClipboard';

interface BulkCopyButtonProps {
  tasks: GanttTask[];
  onCopySuccess?: (message: string) => void;
  className?: string;
}

const BulkCopyButton: React.FC<BulkCopyButtonProps> = ({ 
  tasks, 
  onCopySuccess, 
  className = '' 
}) => {
  const { copied, copyToClipboard } = useClipboard();

  const handleBulkCopy = async () => {
    if (tasks.length === 0) {
      return;
    }

    const textToCopy = tasks
      .map(task => `${task.issueKey} ${task.name}`)
      .join('\n');
    
    const success = await copyToClipboard(textToCopy);
    
    if (success) {
      onCopySuccess?.(`${tasks.length}${MESSAGES.BULK_COPY_SUCCESS}`);
    }
  };

  const isDisabled = tasks.length === 0;
  const title = isDisabled 
    ? 'コピーできるタスクがありません' 
    : `${tasks.length}件のタスクを${BUTTON_LABELS.BULK_COPY}`;

  return (
    <button
      className={`header-btn bulk-copy-btn ${className} ${isDisabled ? 'disabled' : ''}`}
      onClick={handleBulkCopy}
      title={title}
      type="button"
      aria-label={title}
      disabled={isDisabled}
    >
      {copied ? <Check size={UI.ICON_SIZE} /> : <Copy size={UI.ICON_SIZE} />}
      <span>{BUTTON_LABELS.BULK_COPY}</span>
    </button>
  );
};

export default BulkCopyButton;