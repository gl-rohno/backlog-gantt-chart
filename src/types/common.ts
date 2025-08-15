/**
 * 共通の型定義
 */

// 基本的な型
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// イベントハンドラー型
export type EventHandler<T = void> = (event: React.MouseEvent) => T;
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler = (event: React.FormEvent) => void;

// API関連の型
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string | number;
  details?: unknown;
}

// 通知関連の型
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// ローディング状態の型
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// 日付範囲の型
export interface DateRange {
  start: Date;
  end: Date;
}

// サイズ・位置関連の型
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Dimensions extends Position, Size {}

// フィルタ関連の型
export interface FilterOptions {
  users: string[];
  projects: string[];
  startDate: string;
}

// ソート関連の型
export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T = string> {
  column: T;
  direction: SortDirection;
}

// テーマ関連の型
export type ThemeMode = 'light' | 'dark' | 'auto';

// 設定関連の型
export interface UserPreferences {
  theme: ThemeMode;
  language: string;
  notifications: boolean;
}