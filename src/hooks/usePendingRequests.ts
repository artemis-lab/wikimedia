import { useCallback, useMemo, useRef } from "react";

interface UsePendingRequestsReturn<T> {
  getPending: (key: string) => Promise<T> | undefined;
  setPending: (key: string, promise: Promise<T>) => void;
  hasPending: (key: string) => boolean;
  clearPending: (key: string) => void;
}

const usePendingRequests = <T = void>(): UsePendingRequestsReturn<T> => {
  const pendingRequests = useRef<Map<string, Promise<T>>>(new Map());

  const getPending = useCallback((key: string): Promise<T> | undefined => {
    return pendingRequests.current.get(key);
  }, []);

  const setPending = useCallback((key: string, promise: Promise<T>): void => {
    pendingRequests.current.set(key, promise);

    // Auto-cleanup when promise resolves/rejects
    promise.finally(() => {
      pendingRequests.current.delete(key);
    });
  }, []);

  const hasPending = useCallback((key: string): boolean => {
    return pendingRequests.current.has(key);
  }, []);

  const clearPending = useCallback((key: string): void => {
    pendingRequests.current.delete(key);
  }, []);

  return useMemo(
    () => ({ getPending, setPending, hasPending, clearPending }),
    [getPending, setPending, hasPending, clearPending],
  );
};

export { usePendingRequests };
