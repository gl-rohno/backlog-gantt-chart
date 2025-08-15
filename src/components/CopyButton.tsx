import React from 'react';
import { Copy, Check } from 'lucide-react';
import { MESSAGES, UI, CSS_CLASSES, BUTTON_LABELS } from '../constants/app';
import { useClipboard } from '../hooks/useClipboard';

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
  const { copied, copyToClipboard } = useClipboard();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const textToCopy = `${issueKey} ${taskName}`;
    const success = await copyToClipboard(textToCopy);
    
    if (success) {
      onCopySuccess?.(MESSAGES.COPY_SUCCESS);
    }
  };

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