import { useCallback, useMemo, useRef } from "react";

interface UseCacheReturn<T> {
  get: (key: string) => T | undefined;
  set: (key: string, value: T) => void;
  has: (key: string) => boolean;
  clear: () => void;
}

const useCache = <T>(maxSize: number = 50): UseCacheReturn<T> => {
  const cache = useRef<Map<string, T>>(new Map());

  const get = useCallback((key: string): T | undefined => {
    const value = cache.current.get(key);
    if (value !== undefined) {
      // Refresh LRU position by deleting and re-setting
      cache.current.delete(key);
      cache.current.set(key, value);
    }
    return value;
  }, []);

  const set = useCallback(
    (key: string, value: T): void => {
      // Remove if already exists (for LRU repositioning)
      if (cache.current.has(key)) {
        cache.current.delete(key);
      } else if (cache.current.size >= maxSize) {
        // Evict oldest entry if cache is full
        const firstKey = cache.current.keys().next().value;
        if (firstKey) {
          cache.current.delete(firstKey);
        }
      }
      cache.current.set(key, value);
    },
    [maxSize],
  );

  const has = useCallback((key: string): boolean => {
    return cache.current.has(key);
  }, []);

  const clear = useCallback((): void => {
    cache.current.clear();
  }, []);

  return useMemo(() => ({ get, set, has, clear }), [get, set, has, clear]);
};

export { useCache };
