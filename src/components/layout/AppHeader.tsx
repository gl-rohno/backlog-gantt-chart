import React from 'react';
import { Calendar, Settings, RefreshCw, Filter, ChevronLeft } from 'lucide-react';
import BulkCopyButton from '../BulkCopyButton';
import { GanttTask } from '../../types/backlog';

interface AppHeaderProps {
  showSettings: boolean;
  showFilters: boolean;
  loading: boolean;
  getFilteredTasks: () => GanttTask[];
  onToggleFilters: () => void;
  onToggleSettings: () => void;
  onRefresh: () => void;
  onBulkCopySuccess: (message: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  showSettings,
  showFilters,
  loading,
  getFilteredTasks,
  onToggleFilters,
  onToggleSettings,
  onRefresh,
  onBulkCopySuccess,
}) => {
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="header-title">
          <Calendar size={24} />
          <h1>WorkspaceTimeline</h1>
        </div>
      </div>
      <div className="header-bottom">
        <div className="header-left">
          {!showSettings && (
            <>
              <button 
                className={`header-btn ${showFilters ? 'active' : ''}`}
                onClick={onToggleFilters}
                title={showFilters ? 'フィルタを閉じる' : 'フィルタを開く'}
              >
                {showFilters ? <ChevronLeft size={18} /> : <Filter size={18} />}
                <span>フィルタ</span>
              </button>
              <BulkCopyButton
                tasks={getFilteredTasks()}
                onCopySuccess={onBulkCopySuccess}
              />
            </>
          )}
        </div>
        <div className="header-right">
          {!showSettings && (
            <>
              <button 
                className="header-btn"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                <span>更新</span>
              </button>
              <button 
                className="header-btn"
                onClick={onToggleSettings}
              >
                <Settings size={18} />
                <span>設定</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};