import { useCallback, useMemo, useRef } from 'react';
import { DEV_CONFIG } from '../utils/devConfig';

/**
 * 高頻度で呼ばれる関数をデバウンスするフック
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
};

/**
 * 高頻度で呼ばれる関数をスロットリングするフック
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * 深い比較を行うuseMemo
 */
export const useDeepMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  const previousDepsRef = useRef<React.DependencyList>();
  const memoizedValueRef = useRef<T>();

  const hasChanged = useMemo(() => {
    if (!previousDepsRef.current) return true;
    if (deps.length !== previousDepsRef.current.length) return true;
    
    return deps.some((dep, index) => {
      const prevDep = previousDepsRef.current![index];
      return !deepEqual(dep, prevDep);
    });
  }, deps);

  if (hasChanged) {
    memoizedValueRef.current = factory();
    previousDepsRef.current = deps;
  }

  return memoizedValueRef.current!;
};

/**
 * 仮想スクロール用のアイテム計算フック
 */
export const useVirtualList = <T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5
) => {
  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const totalHeight = items.length * itemHeight;
    
    return {
      totalHeight,
      visibleCount,
      getVisibleRange: (scrollTop: number) => {
        const start = Math.floor(scrollTop / itemHeight);
        const end = Math.min(start + visibleCount + overscan, items.length);
        const startIndex = Math.max(0, start - overscan);
        
        return {
          startIndex,
          endIndex: end,
          visibleItems: items.slice(startIndex, end),
          offsetY: startIndex * itemHeight,
        };
      },
    };
  }, [items, containerHeight, itemHeight, overscan]);
};

/**
 * インターセクションオブザーバーを使った可視性監視フック
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  const observe = useCallback((callback: (entry: IntersectionObserverEntry) => void) => {
    if (!elementRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(callback);
      },
      options
    );

    observerRef.current.observe(elementRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [options]);

  return { elementRef, observe };
};

/**
 * レンダリングパフォーマンスを測定するフック
 */
export const useRenderTime = (componentName: string, options?: { 
  enabled?: boolean; 
  threshold?: number; 
  logLevel?: 'log' | 'warn' | 'error';
}) => {
  const renderStartRef = useRef<number>();
  const { 
    enabled = DEV_CONFIG.enablePerformanceLogging, // 開発設定から読み取り
    threshold = DEV_CONFIG.performanceThreshold, // 開発設定から読み取り
    logLevel = 'warn' 
  } = options || {};

  if (process.env.NODE_ENV === 'development' && enabled) {
    if (!renderStartRef.current) {
      renderStartRef.current = performance.now();
    }

    // useEffectの代わりにレンダリング後に実行
    Promise.resolve().then(() => {
      if (renderStartRef.current) {
        const renderTime = performance.now() - renderStartRef.current;
        if (renderTime > threshold) {
          const message = `[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`;
          console[logLevel](message);
        }
        renderStartRef.current = undefined;
      }
    });
  }
};

// ヘルパー関数
const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  return false;
};