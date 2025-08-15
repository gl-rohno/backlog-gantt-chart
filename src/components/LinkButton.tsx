import React from 'react';
import { ExternalLink } from 'lucide-react';
import { GanttTask } from '../types/backlog';
import { UI } from '../constants/app';

interface LinkButtonProps {
  task: GanttTask;
  spaceId: string;
  className?: string;
}

const LinkButton: React.FC<LinkButtonProps> = ({ 
  task, 
  spaceId,
  className = '' 
}) => {
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!spaceId) {
      console.warn('スペースIDが設定されていません');
      return;
    }
    
    // BacklogのURL形式: https://{space}.backlog.com/view/{issueKey}
    const backlogUrl = `https://${spaceId}.backlog.com/view/${task.issueKey}`;
    window.open(backlogUrl, '_blank', 'noopener,noreferrer');
  };

  const title = `Backlogで${task.issueKey}を開く`;

  return (
    <button
      className={`link-button ${className}`}
      onClick={handleLinkClick}
      title={title}
      type="button"
      aria-label={title}
    >
      <ExternalLink size={UI.ICON_SIZE} />
    </button>
  );
};

export default LinkButton;