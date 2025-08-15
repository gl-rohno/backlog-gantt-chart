import { addMonths, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from '../types/common';

/**
 * 日付範囲を生成
 */
export const createDateRange = (startDate: Date, monthsToAdd: number = 6): DateRange => {
  const start = startOfDay(startDate);
  const end = endOfDay(addMonths(start, monthsToAdd));
  
  return { start, end };
};

/**
 * 日付範囲内の全日付を取得
 */
export const getDaysInRange = (dateRange: DateRange): Date[] => {
  return eachDayOfInterval(dateRange);
};

/**
 * 今日の日付を取得（時間を00:00:00にリセット）
 */
export const getToday = (): Date => {
  return startOfDay(new Date());
};

/**
 * 日付文字列をDateオブジェクトに変換
 */
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * 日付をISO文字列に変換（日付部分のみ）
 */
export const formatDateToISO = (date: Date | null): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

/**
 * 日付が有効かどうかをチェック
 */
export const isValidDate = (date: unknown): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};