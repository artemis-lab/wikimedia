import "@testing-library/jest-dom/vitest";

import { vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  value: vi.fn().mockImplementation((query) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
  writable: true,
});

class ResizeObserverMock {
  disconnect = vi.fn();
  observe = vi.fn();
  unobserve = vi.fn();
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
