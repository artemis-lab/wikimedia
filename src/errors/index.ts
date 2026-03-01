import type { ErrorDetails, ErrorType } from "../types";

const ErrorTypeValues = {
  API: "api",
  CANCELLED: "cancelled",
  NETWORK: "network",
  NOT_FOUND: "not_found",
  PERMISSION: "permission",
  RATE_LIMIT: "rate_limit",
  SERVER_ERROR: "server_error",
  TIMEOUT: "timeout",
  UNKNOWN: "unknown",
  VALIDATION: "validation",
} as const;

const classifyError = (error: unknown): ErrorType => {
  if (!(error instanceof Error)) {
    return ErrorTypeValues.UNKNOWN;
  }

  const message = error.message;
  const lowerMessage = message.toLowerCase();

  // Check for cancelled/aborted requests first
  if (error.name === "AbortError" || lowerMessage.includes("aborted")) {
    return ErrorTypeValues.CANCELLED;
  }

  // Check for network errors
  if (
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("network") ||
    error.name === "TypeError"
  ) {
    return ErrorTypeValues.NETWORK;
  }

  // Check for timeout errors
  if (lowerMessage.includes("timeout") || error.name === "TimeoutError") {
    return ErrorTypeValues.TIMEOUT;
  }

  // Check for HTTP status codes
  const statusMatch = message.match(/status:\s*(\d+)/i);
  if (statusMatch && statusMatch[1]) {
    const status = parseInt(statusMatch[1], 10);
    return getHttpStatusCategory(status);
  }

  // Check for validation errors
  if (lowerMessage.includes("invalid")) {
    return ErrorTypeValues.VALIDATION;
  }

  return ErrorTypeValues.UNKNOWN;
};

const extractErrorCode = (error: unknown): string | undefined => {
  if (!(error instanceof Error)) {
    return undefined;
  }

  const message = error.message;

  // Extract HTTP status codes
  const statusMatch = message.match(/status:\s*(\d+)/i);
  if (statusMatch) {
    return statusMatch[1];
  }

  // Extract other error codes if present
  const codeMatch = message.match(/code:\s*([A-Z_]+)/i);
  if (codeMatch) {
    return codeMatch[1];
  }

  // Use error name for specific error types
  if (error.name && error.name !== "Error") {
    return error.name;
  }

  return undefined;
};

const getErrorDetails = (error: unknown): ErrorDetails => {
  if (error instanceof Error) {
    return {
      code: extractErrorCode(error),
      message: error.message,
      type: classifyError(error),
      userMessage: getUserFriendlyMessage(error),
    };
  }

  const errorString = String(error);
  return {
    code: undefined,
    message: errorString,
    type: ErrorTypeValues.UNKNOWN,
    userMessage: "Something went wrong. Please try again.",
  };
};

const getHttpStatusCategory = (status: number): ErrorType => {
  if (status === 401 || status === 403) {
    return ErrorTypeValues.PERMISSION;
  }
  if (status === 404) {
    return ErrorTypeValues.NOT_FOUND;
  }
  if (status === 408) {
    return ErrorTypeValues.TIMEOUT;
  }
  if (status === 429) {
    return ErrorTypeValues.RATE_LIMIT;
  }
  if (status >= 500) {
    return ErrorTypeValues.SERVER_ERROR;
  }
  return ErrorTypeValues.API;
};

const getUserFriendlyMessage = (error: Error): string => {
  const errorType = classifyError(error);

  switch (errorType) {
    case ErrorTypeValues.API:
      return "Server error. Please try again later.";

    case ErrorTypeValues.CANCELLED:
      return "Request was cancelled.";

    case ErrorTypeValues.NETWORK:
      return "Network connection failed. Please check your internet connection.";

    case ErrorTypeValues.NOT_FOUND:
      return "No events found for this date.";

    case ErrorTypeValues.PERMISSION:
      return "Access denied. Please check your permissions.";

    case ErrorTypeValues.RATE_LIMIT:
      return "Too many requests. Please wait a moment and try again.";

    case ErrorTypeValues.SERVER_ERROR:
      return "Server error. Please try again later.";

    case ErrorTypeValues.TIMEOUT:
      return "Request timed out. Please try again.";

    case ErrorTypeValues.VALIDATION:
      return "Invalid data received. Please try again.";

    default:
      return "Something went wrong. Please try again.";
  }
};

export { getErrorDetails };
