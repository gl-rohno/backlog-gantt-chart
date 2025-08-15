import { GanttTask } from './backlog';
import { SortDirection, Position, DateRange } from './common';

// Re-export for convenience
export type { SortDirection };

// ガントチャート固有のソートカラム
export type SortColumn = 'projectKey' | 'name' | 'assignee' | 'startDate' | 'endDate' | 'status';

// ガントチャート固有のソート状態
export interface SortState {
  sortColumn: SortColumn | null;
  sortDirection: SortDirection | null;
}

// モーダル状態
export interface ModalState {
  show: boolean;
  task: GanttTask | null;
}

// ドラッグ状態
export interface DragState {
  isDragging: boolean;
  dragStart: Position;
  scrollStart: Position;
}

// 編集状態
export interface EditState {
  editMode: boolean;
  editForm: Partial<GanttTask>;
}

// ガントチャートの表示設定
export interface GanttDisplayOptions {
  showWeekends: boolean;
  showHolidays: boolean;
  timeScale: 'day' | 'week' | 'month';
  showProgress: boolean;
}

// タスクバーのスタイル情報
export interface TaskBarStyle {
  left: string;
  width: string;
  backgroundColor: string;
  display?: string;
}

// ガントチャートの設定
export interface GanttConfig {
  dateRange: DateRange;
  displayOptions: GanttDisplayOptions;
  columnWidths: Record<string, number>;
}