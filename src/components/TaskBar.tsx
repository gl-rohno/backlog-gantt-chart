import React from 'react';
import { GanttTask } from '../types/backlog';
import { getTaskStyle, getTaskBarColor, shouldShowTaskText } from '../utils/ganttUtils';

interface TaskBarProps {
  task: GanttTask;
  days: Date[];
  dateRange: { start: Date; end: Date };
  startDate: Date;
  onTaskClick: (e: React.MouseEvent, task: GanttTask) => void;
}

export const TaskBar: React.FC<TaskBarProps> = React.memo(({
  task,
  days,
  dateRange,
  startDate,
  onTaskClick
}) => {
  const taskStyle = getTaskStyle(task, days, dateRange);
  const taskBarColor = getTaskBarColor(task);
  const showText = shouldShowTaskText(task, startDate);

  return (
    <div 
      className="gantt-bar"
      style={{
        ...taskStyle,
        backgroundColor: taskBarColor,
        cursor: taskStyle.display === 'none' ? 'default' : 'pointer'
      }}
      title={`${task.name} (${task.status})`}
      onClick={(e) => {
        if (taskStyle.display !== 'none') {
          onTaskClick(e, task);
        }
      }}
    >
      {showText && (
        <span className="gantt-bar-text">
          {task.name}
        </span>
      )}
    </div>
  );
});

TaskBar.displayName = 'TaskBar';