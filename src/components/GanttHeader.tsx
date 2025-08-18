import React, { useState, useCallback } from 'react';
import { format, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { SortColumn, SortDirection } from '../types/gantt';

interface GanttHeaderProps {
  chartWidth: number;
  days: Date[];
  sortColumn: SortColumn | null;
  sortDirection: SortDirection | null;
  onSort: (column: SortColumn) => void;
  columnWidths?: {
    project: number;
    task: number;
    assignee: number;
    startDate: number;
    endDate: number;
    status: number;
  };
  onColumnResize?: (columnKey: string, width: number) => void;
}

export const GanttHeader: React.FC<GanttHeaderProps> = ({
  chartWidth,
  days,
  sortColumn,
  sortDirection,
  onSort,
  columnWidths = {
    project: 70,
    task: 200,
    assignee: 90,
    startDate: 80,
    endDate: 80,
    status: 90
  },
  onColumnResize
}) => {
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    }
    return null;
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(columnKey);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnKey as keyof typeof columnWidths]);
  }, [columnWidths]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !onColumnResize) return;
    
    const diff = e.clientX - startX;
    const newWidth = Math.max(50, startWidth + diff);
    onColumnResize(isResizing, newWidth);
  }, [isResizing, startX, startWidth, onColumnResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(null);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const renderHeaderCell = (
    columnKey: string,
    title: string,
    sortKey: SortColumn,
    width: number
  ) => (
    <div 
      className="header-cell sortable resizable" 
      style={{ width: `${width}px` }}
      onClick={() => onSort(sortKey)}
    >
      <span>{title}</span>
      {renderSortIcon(sortKey)}
      {onColumnResize && (
        <div 
          className="resize-handle"
          onMouseDown={(e) => handleMouseDown(e, columnKey)}
        />
      )}
    </div>
  );


  return (
    <div className="gantt-header" style={{ minWidth: `${chartWidth}px` }}>
      <div className="gantt-header-left">
        {renderHeaderCell('project', 'プロジェクト', 'projectKey', columnWidths.project)}
        {renderHeaderCell('task', 'タスク名', 'name', columnWidths.task)}
        {renderHeaderCell('assignee', '担当者', 'assignee', columnWidths.assignee)}
        {renderHeaderCell('startDate', '開始日', 'startDate', columnWidths.startDate)}
        {renderHeaderCell('endDate', '期限日', 'endDate', columnWidths.endDate)}
        {renderHeaderCell('status', 'ステータス', 'status', columnWidths.status)}
      </div>
      <div className="gantt-header-right">
        <div className="gantt-timeline">
          {days.map((day, index) => {
            const isCurrentDay = isToday(day);
            return (
              <div key={index} className={`timeline-cell ${isCurrentDay ? 'timeline-cell-today' : ''}`}>
                <div className="timeline-date">
                  {format(day, 'd', { locale: ja })}
                </div>
                <div className="timeline-month">
                  {format(day, 'MMM', { locale: ja })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};