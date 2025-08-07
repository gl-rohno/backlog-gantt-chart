import { format, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { GanttTask } from '../types/backlog';

export const formatDate = (date: Date | null): string => {
  if (!date) return '未設定';
  return format(date, 'yyyy/MM/dd', { locale: ja });
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case '完了':
    case 'Closed':
      return '#38a169';
    case '処理中':
    case 'In Progress':
      return '#3182ce';
    case '未対応':
    case 'Open':
      return '#718096';
    default:
      return '#718096';
  }
};

export const getTaskBarColor = (task: GanttTask): string => {
  // 期限切れかつ未完了の場合は赤色で強調（日付が設定されている場合のみ）
  const isOverdue = task.endDate && task.endDate < new Date() && task.status !== '完了' && task.status !== 'Closed';
  if (isOverdue) {
    return '#e53e3e'; // 赤色
  }
  return getStatusColor(task.status);
};

export const getTaskStyle = (task: GanttTask, days: Date[], dateRange: { start: Date; end: Date }) => {
  if (!dateRange || !task.startDate || !task.endDate) return { display: 'none' };
  
  const totalDays = days.length;
  const startIndex = days.findIndex(day => isSameDay(day, task.startDate!));
  const endIndex = days.findIndex(day => isSameDay(day, task.endDate!));
  
  const left = (startIndex / totalDays) * 100;
  const width = ((endIndex - startIndex + 1) / totalDays) * 100;
  
  return {
    left: `${left}%`,
    width: `${width}%`
  };
};

export const shouldShowTaskText = (task: GanttTask, startDate: Date): boolean => {
  return !!(task.endDate && task.endDate >= startDate);
};