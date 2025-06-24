import { useCallback, useRef, useEffect } from 'react';

interface PerformanceOptions {
  debounceMs?: number;
  throttleMs?: number;
  maxConcurrentOperations?: number;
}

export const usePerformanceOptimization = (options: PerformanceOptions = {}) => {
  const {
    debounceMs = 300,
    throttleMs = 100,
    maxConcurrentOperations = 3
  } = options;

  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const throttleTimersRef = useRef<Map<string, number>>(new Map());
  const operationCountRef = useRef(0);
  const pendingOperationsRef = useRef<Array<() => void>>([]);

  // تنظيف المؤقتات عند إلغاء التحميل
  useEffect(() => {
    return () => {
      debounceTimersRef.current.forEach(timer => clearTimeout(timer));
      debounceTimersRef.current.clear();
      throttleTimersRef.current.clear();
    };
  }, []);

  // دالة Debounce محسنة
  const debounce = useCallback((key: string, fn: () => void, delay: number = debounceMs) => {
    const existingTimer = debounceTimersRef.current.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      fn();
      debounceTimersRef.current.delete(key);
    }, delay);

    debounceTimersRef.current.set(key, timer);
  }, [debounceMs]);

  // دالة Throttle محسنة
  const throttle = useCallback((key: string, fn: () => void, delay: number = throttleMs) => {
    const lastExecution = throttleTimersRef.current.get(key) || 0;
    const now = Date.now();

    if (now - lastExecution >= delay) {
      fn();
      throttleTimersRef.current.set(key, now);
    }
  }, [throttleMs]);

  // إدارة العمليات المتزامنة
  const executeWithConcurrencyLimit = useCallback(async (operation: () => Promise<void>) => {
    if (operationCountRef.current >= maxConcurrentOperations) {
      // إضافة العملية إلى قائمة الانتظار
      return new Promise<void>((resolve) => {
        pendingOperationsRef.current.push(async () => {
          await operation();
          resolve();
        });
      });
    }

    operationCountRef.current++;
    
    try {
      await operation();
    } finally {
      operationCountRef.current--;
      
      // تنفيذ العملية التالية في قائمة الانتظار
      const nextOperation = pendingOperationsRef.current.shift();
      if (nextOperation) {
        executeWithConcurrencyLimit(async () => {
          await nextOperation();
        });
      }
    }
  }, [maxConcurrentOperations]);

  // دالة لتأخير التنفيذ حتى الإطار التالي
  const scheduleForNextFrame = useCallback((fn: () => void) => {
    requestAnimationFrame(() => {
      // استخدام setTimeout للتأكد من أن العملية تتم بعد التصيير
      setTimeout(fn, 0);
    });
  }, []);

  // دالة لتقسيم المهام الثقيلة
  const chunkWork = useCallback(async <T>(
    items: T[],
    processor: (item: T, index: number) => Promise<void> | void,
    chunkSize: number = 5,
    delayBetweenChunks: number = 10
  ) => {
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      
      // معالجة المجموعة الحالية
      await Promise.all(
        chunk.map((item, index) => processor(item, i + index))
      );
      
      // تأخير قصير بين المجموعات لتجنب حجب الخيط الرئيسي
      if (i + chunkSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenChunks));
      }
    }
  }, []);

  // دالة لمراقبة الأداء
  const measurePerformance = useCallback(<T>(
    name: string,
    fn: () => T | Promise<T>
  ): T | Promise<T> => {
    const start = performance.now();
    
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now();
        console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`);
      });
    } else {
      const end = performance.now();
      console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`);
      return result;
    }
  }, []);

  return {
    debounce,
    throttle,
    executeWithConcurrencyLimit,
    scheduleForNextFrame,
    chunkWork,
    measurePerformance,
    getCurrentOperationCount: () => operationCountRef.current,
    getPendingOperationsCount: () => pendingOperationsRef.current.length
  };
};