import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { SortColumn, SortDirection } from '../types/gantt';

interface GanttHeaderProps {
  chartWidth: number;
  days: Date[];
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

export const GanttHeader: React.FC<GanttHeaderProps> = ({
  chartWidth,
  days,
  sortColumn,
  sortDirection,
  onSort
}) => {
  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    }
    return null;
  };

  return (
    <div className="gantt-header" style={{ minWidth: `${chartWidth}px` }}>
      <div className="gantt-header-left">
        <div className="header-cell sortable" onClick={() => onSort('project')}>
          <span>プロジェクト</span>
          {renderSortIcon('project')}
        </div>
        <div className="header-cell sortable" onClick={() => onSort('task')}>
          <span>タスク名</span>
          {renderSortIcon('task')}
        </div>
        <div className="header-cell sortable" onClick={() => onSort('assignee')}>
          <span>担当者</span>
          {renderSortIcon('assignee')}
        </div>
        <div className="header-cell sortable" onClick={() => onSort('startDate')}>
          <span>開始日</span>
          {renderSortIcon('startDate')}
        </div>
        <div className="header-cell sortable" onClick={() => onSort('endDate')}>
          <span>期限日</span>
          {renderSortIcon('endDate')}
        </div>
        <div className="header-cell sortable" onClick={() => onSort('status')}>
          <span>ステータス</span>
          {renderSortIcon('status')}
        </div>
      </div>
      <div className="gantt-header-right">
        <div className="gantt-timeline">
          {days.map((day, index) => (
            <div key={index} className="timeline-cell">
              <div className="timeline-date">
                {format(day, 'd', { locale: ja })}
              </div>
              <div className="timeline-month">
                {format(day, 'MMM', { locale: ja })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};