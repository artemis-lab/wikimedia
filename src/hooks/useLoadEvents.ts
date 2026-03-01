import { useCallback, useEffect, useRef, useState } from "react";

import { ON_THIS_DAY_WIKIMEDIA_API_URL } from "../constants";
import { getErrorDetails } from "../errors";
import type { Event, EventsResponse } from "../types";
import { useCache } from "./useCache";
import { usePendingRequests } from "./usePendingRequests";

interface UseLoadEventsReturn {
  data: Event[] | null;
  error: string | null;
  isLoading: boolean;
  loadEvents: (day: string, month: string, type: string) => Promise<void>;
  resetState: () => void;
}

const buildApiUrl = (day: string, month: string, type: string): string => {
  return ON_THIS_DAY_WIKIMEDIA_API_URL.replace("{type}", type)
    .replace("{MM}", month)
    .replace("{DD}", day);
};

const validateApiResponse = (json: unknown, type: string): Event[] => {
  // Validate response structure
  if (
    !json ||
    typeof json !== "object" ||
    !Array.isArray((json as EventsResponse)[type])
  ) {
    throw new Error(`Invalid API response structure for type: ${type}`);
  }

  // Validate each event has required fields
  const events = (json as EventsResponse)[type];

  if (!events) {
    throw new Error(`No events found for type: ${type}`);
  }

  for (const event of events) {
    if (
      !event ||
      typeof event.text !== "string" ||
      typeof event.year !== "number"
    ) {
      throw new Error("Invalid event data structure in API response");
    }
  }

  return events;
};

const fetchEventsFromApi = async (
  url: string,
  signal: AbortSignal,
  type: string,
): Promise<Event[]> => {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = await response.json();
  return validateApiResponse(json, type);
};

const useLoadEvents = (): UseLoadEventsReturn => {
  const [data, setData] = useState<Event[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cache = useCache<Event[]>();
  const pendingRequests = usePendingRequests();

  const loadEvents = useCallback(
    async (day: string, month: string, type: string): Promise<void> => {
      const url = buildApiUrl(day, month, type);

      // Check for pending request for same URL
      const existingRequest = pendingRequests.getPending(url);
      if (existingRequest) {
        await existingRequest;
        return;
      }

      // Clear previous state
      setData(null);
      setError(null);

      // Create the request promise
      const requestPromise = (async (): Promise<void> => {
        try {
          // Cancel any previous request
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }

          // Create new abort controller for this request
          abortControllerRef.current = new AbortController();
          setIsLoading(true);

          // Check cache first
          let events = cache.get(url);

          if (!events) {
            // Not in cache - fetch and add
            events = await fetchEventsFromApi(
              url,
              abortControllerRef.current.signal,
              type,
            );
          }

          // Always set to refresh LRU position (works for both new and existing)
          cache.set(url, events);

          setData(events);
        } catch (error) {
          // Don't treat aborted requests as errors
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }

          const errorDetails = getErrorDetails(error);
          console.error(`Failed to load ${type} events using URL ${url}:`, {
            code: errorDetails.code,
            message: errorDetails.message,
            type: errorDetails.type,
            userMessage: errorDetails.userMessage,
          });
          setError(errorDetails.userMessage);
        } finally {
          setIsLoading(false);
        }
      })();

      // Store the promise for deduplication (auto-cleanup is handled by usePendingRequests)
      pendingRequests.setPending(url, requestPromise);

      await requestPromise;
    },
    [cache, pendingRequests],
  );

  const resetState = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, error, isLoading, loadEvents, resetState };
};

export { useLoadEvents };
