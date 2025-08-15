import { useState, useCallback, useEffect } from 'react';
import { LoadingState } from '../types/common';

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * 非同期処理を管理するカスタムフック
 */
export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) => {
  const { immediate = false, onSuccess, onError } = options;
  
  const [state, setState] = useState<LoadingState & { data: T | null }>({
    isLoading: false,
    error: null,
    data: null
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await asyncFunction();
      setState({ isLoading: false, error: null, data });
      onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState({ isLoading: false, error: errorMessage, data: null });
      onError?.(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    }
  }, [asyncFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, data: null });
  }, []);

  // immediate が true の場合、マウント時に実行
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset
  };
};