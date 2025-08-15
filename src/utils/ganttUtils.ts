import { format, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { GanttTask } from '../types/backlog';
import { DateRange } from '../types/common';
import { TaskBarStyle } from '../types/gantt';
import { COLORS, STATUS } from '../constants/app';

/**
 * 日付のフォーマット
 */
export const formatDate = (date: Date | null): string => {
  if (!date) return '未設定';
  return format(date, 'yyyy/MM/dd', { locale: ja });
};

// 型ガードを作成してtype assertionを避ける
const isCompletedStatus = (status: string): boolean => {
  return STATUS.COMPLETED.includes(status as '完了' | 'Closed');
};

const isInProgressStatus = (status: string): boolean => {
  return STATUS.IN_PROGRESS.includes(status as '処理中' | 'In Progress');
};

const isOpenStatus = (status: string): boolean => {
  return STATUS.OPEN.includes(status as '未対応' | 'Open');
};

/**
 * ステータスに応じた色を取得
 */
export const getStatusColor = (status: string): string => {
  if (isCompletedStatus(status)) {
    return COLORS.STATUS.COMPLETED;
  }
  if (isInProgressStatus(status)) {
    return COLORS.STATUS.IN_PROGRESS;
  }
  if (isOpenStatus(status)) {
    return COLORS.STATUS.OPEN;
  }
  return COLORS.STATUS.DEFAULT;
};

/**
 * タスクの期限切れ状態をチェック
 */
export const isTaskOverdue = (task: GanttTask): boolean => {
  return !!(
    task.endDate && 
    task.endDate < new Date() && 
    !isCompletedStatus(task.status)
  );
};

/**
 * タスクバーの色を取得（期限切れの場合は赤色）
 */
export const getTaskBarColor = (task: GanttTask): string => {
  if (isTaskOverdue(task)) {
    return COLORS.STATUS.OVERDUE;
  }
  return getStatusColor(task.status);
};

/**
 * タスクバーのスタイルを計算
 */
export const getTaskStyle = (
  task: GanttTask, 
  days: Date[], 
  dateRange: DateRange
): TaskBarStyle => {
  if (!dateRange || !task.startDate || !task.endDate) {
    return { 
      left: '0%', 
      width: '0%', 
      backgroundColor: getTaskBarColor(task),
      display: 'none' 
    };
  }
  
  const totalDays = days.length;
  const startIndex = days.findIndex(day => isSameDay(day, task.startDate!));
  const endIndex = days.findIndex(day => isSameDay(day, task.endDate!));
  
  if (startIndex === -1 || endIndex === -1) {
    return { 
      left: '0%', 
      width: '0%', 
      backgroundColor: getTaskBarColor(task),
      display: 'none' 
    };
  }
  
  const left = (startIndex / totalDays) * 100;
  const width = ((endIndex - startIndex + 1) / totalDays) * 100;
  
  return {
    left: `${Math.max(0, left)}%`,
    width: `${Math.max(0, width)}%`,
    backgroundColor: getTaskBarColor(task)
  };
};

/**
 * タスクテキストを表示すべきかチェック
 */
export const shouldShowTaskText = (task: GanttTask, startDate: Date): boolean => {
  return !!(task.endDate && task.endDate >= startDate);
};

/**
 * 完了したタスクをフィルタリング（期限日前に完了したもの、期限日未設定で完了したものを除外）
 */
export const filterCompletedTasks = (tasks: GanttTask[], startDate: Date): GanttTask[] => {
  return tasks.filter(task => {
    const isCompleted = task.status === '完了';
    const isEndBeforeStart = task.endDate && task.endDate < startDate;
    
    if (isCompleted && isEndBeforeStart) return false;
    if (isCompleted && !task.endDate) return false;
    
    return true;
  });
};

