import { act, renderHook } from "@testing-library/react";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import { useLoadEvents } from "../../../src/hooks/useLoadEvents";
import { type EventsResponse } from "../../../src/types";

describe("useLoadEvents", () => {
  const fetchSpy = vi.spyOn(window, "fetch");

  const defaultMockResponse: Response = {
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    body: null,
    bodyUsed: false,
    bytes: async () => new Uint8Array(),
    clone: () => defaultMockResponse,
    formData: async () => new FormData(),
    headers: new Headers(),
    json: async () => ({}),
    ok: true,
    redirected: false,
    status: 200,
    statusText: "OK",
    text: async () => "",
    type: "basic",
    url: "mock-url",
  };
  const eventsData: EventsResponse = {
    births: [
      {
        text: "Jannik Sinner, Italian tennis player",
        year: 2001,
      },
      {
        text: "Karen Chen, American figure skater",
        year: 1999,
      },
      {
        text: "Greyson Chance, American musician",
        year: 1997,
      },
    ],
  };

  afterEach(() => {
    fetchSpy.mockReset();
  });

  afterAll(() => {
    fetchSpy.mockRestore();
  });

  it("should create hook with initial state", () => {
    const { result } = renderHook(() => useLoadEvents());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.loadEvents).toBeDefined();
  });

  it("should fetch events", async () => {
    const mockResponse: Response = {
      ...defaultMockResponse,
      json: async () => eventsData,
    };
    fetchSpy.mockReturnValue(
      new Promise((resolve) => {
        resolve(mockResponse);
      }),
    );

    const { result } = renderHook(() => useLoadEvents());

    await act(async () => {
      await result.current.loadEvents("28", "02", "births");
    });

    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(eventsData["births"]);
    expect(result.current.isLoading).toBe(false);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/births/02/28",
      {
        signal: expect.objectContaining({
          aborted: false,
          addEventListener: expect.any(Function),
          dispatchEvent: expect.any(Function),
          removeEventListener: expect.any(Function),
        }),
      },
    );
  });

  it("should fetch events only once for the same day and month", async () => {
    const mockResponse: Response = {
      ...defaultMockResponse,
      json: async () => eventsData,
    };
    fetchSpy.mockReturnValue(
      new Promise((resolve) => {
        resolve(mockResponse);
      }),
    );

    const { result } = renderHook(() => useLoadEvents());

    await act(async () => {
      await result.current.loadEvents("28", "02", "births");
      await result.current.loadEvents("28", "02", "births");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("should return error message if fetch failed", async () => {
    fetchSpy.mockReturnValue(
      new Promise((_resolve, reject) => {
        reject(new Error("Internal error"));
      }),
    );

    const { result } = renderHook(() => useLoadEvents());

    await act(async () => {
      await result.current.loadEvents("28", "02", "births");
    });

    expect(result.current.error).toBe(
      "Something went wrong. Please try again.",
    );
    expect(result.current.data).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
