interface ErrorDetails {
  code?: string;
  message: string;
  type: ErrorType;
  userMessage: string;
}

type ErrorType =
  | "api"
  | "cancelled"
  | "network"
  | "not_found"
  | "permission"
  | "rate_limit"
  | "server_error"
  | "timeout"
  | "unknown"
  | "validation";

interface Event {
  text: string;
  year: number;
}

type EventsResponse = {
  [key: string]: Event[];
};

interface EventsState {
  activePage: number;
  date: number;
  events: Event[];
  isDescendingOrder: boolean;
  notification: Notification | null;
}

interface Notification {
  message: string;
  title: string;
}

interface PaginationData {
  endIndex: number;
  paginationMessage: string;
  startIndex: number;
  total: number;
  totalPages: number;
}

export type {
  ErrorDetails,
  ErrorType,
  Event,
  EventsResponse,
  EventsState,
  Notification,
  PaginationData,
};
