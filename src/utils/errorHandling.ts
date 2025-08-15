import { MESSAGES } from '../constants/app';

export type ErrorType = 'api' | 'validation' | 'network' | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
}

export const createError = (
  type: ErrorType,
  message: string,
  originalError?: unknown
): AppError => ({
  type,
  message,
  originalError,
});

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      return createError('network', 'ネットワークエラーが発生しました', error);
    }
    return createError('api', error.message, error);
  }
  
  return createError('unknown', MESSAGES.ERROR_OCCURRED, error);
};

export const handleValidationError = (message: string): AppError => {
  return createError('validation', message);
};

export const getErrorMessage = (error: AppError): string => {
  switch (error.type) {
    case 'api':
      return `API エラー: ${error.message}`;
    case 'network':
      return `ネットワークエラー: ${error.message}`;
    case 'validation':
      return `入力エラー: ${error.message}`;
    default:
      return error.message || MESSAGES.ERROR_OCCURRED;
  }
};

export const logError = (error: AppError): void => {
  console.error(`[${error.type.toUpperCase()}]`, error.message, error.originalError);
};