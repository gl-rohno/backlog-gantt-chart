import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { MESSAGES, TIMING, UI, CSS_CLASSES, BUTTON_LABELS } from '../constants/app';

interface CopyButtonProps {
  issueKey: string;
  taskName: string;
  onCopySuccess?: (message: string) => void;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ 
  issueKey, 
  taskName, 
  onCopySuccess, 
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const textToCopy = `${issueKey} ${taskName}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onCopySuccess?.(MESSAGES.COPY_SUCCESS);
      
      setTimeout(() => setCopied(false), TIMING.COPY_FEEDBACK_DURATION);
    } catch (err) {
      console.error(MESSAGES.COPY_FAILED, err);
    }
  }, [issueKey, taskName, onCopySuccess]);

  const title = `${issueKey} ${taskName}${BUTTON_LABELS.COPY_TASK}`;

  return (
    <button
      className={`${CSS_CLASSES.COPY_BUTTON} ${className}`}
      onClick={handleCopy}
      title={title}
      type="button"
      aria-label={title}
    >
      {copied ? <Check size={UI.ICON_SIZE} /> : <Copy size={UI.ICON_SIZE} />}
    </button>
  );
};

export default CopyButton;