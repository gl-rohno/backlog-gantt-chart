import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { GanttTask } from '../types/backlog';
import { MESSAGES, TIMING, UI, BUTTON_LABELS } from '../constants/app';

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
  const [copied, setCopied] = useState(false);

  const handleBulkCopy = useCallback(async () => {
    if (tasks.length === 0) {
      return;
    }

    // 課題キーと課題名称を改行区切りで結合
    const textToCopy = tasks
      .map(task => `${task.issueKey} ${task.name}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onCopySuccess?.(`${tasks.length}${MESSAGES.BULK_COPY_SUCCESS}`);
      
      setTimeout(() => setCopied(false), TIMING.COPY_FEEDBACK_DURATION);
    } catch (err) {
      console.error(MESSAGES.COPY_FAILED, err);
    }
  }, [tasks, onCopySuccess]);

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
      {BUTTON_LABELS.BULK_COPY}
    </button>
  );
};

export default BulkCopyButton;