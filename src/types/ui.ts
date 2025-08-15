// UI関連の共通型定義

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface BaseComponentProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
}

export interface ClickableProps {
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  title?: string;
}

export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface SortState<T = string> {
  column: T;
  direction: 'asc' | 'desc';
}

export type Notification = {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
};