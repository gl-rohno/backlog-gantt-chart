// API関連の共通型定義

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  body?: Record<string, unknown>;
  timeout?: number;
}

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = unknown> {
  data: T | null;
  status: RequestStatus;
  error: string | null;
  lastFetched?: Date;
}