import { describe, expect, it } from "vitest";

import { getErrorDetails } from "../../../src/errors";

describe("error", () => {
  it("should return error details from an error object", () => {
    const error = new Error("Network error message");
    const errorDetails = getErrorDetails(error);

    expect(errorDetails.message).toBe("Network error message");
    expect(errorDetails.type).toBe("network");
    expect(errorDetails.userMessage).toBe(
      "Network connection failed. Please check your internet connection.",
    );
  });

  it("should return error details from a non-error object", () => {
    const error = 123;
    const errorDetails = getErrorDetails(error);

    expect(errorDetails.message).toBe("123");
    expect(errorDetails.type).toBe("unknown");
    expect(errorDetails.userMessage).toBe(
      "Something went wrong. Please try again.",
    );
  });

  it("should classify 404 errors correctly", () => {
    const error = new Error("HTTP error! status: 404");
    const errorDetails = getErrorDetails(error);

    expect(errorDetails.type).toBe("not_found");
    expect(errorDetails.userMessage).toBe("No events found for this date.");
  });

  it("should classify validation errors correctly", () => {
    const error = new Error("Invalid data structure");
    const errorDetails = getErrorDetails(error);

    expect(errorDetails.type).toBe("validation");
    expect(errorDetails.userMessage).toBe(
      "Invalid data received. Please try again.",
    );
  });

  it("should extract HTTP status codes correctly", () => {
    const error = new Error("HTTP error! status: 404");
    const errorDetails = getErrorDetails(error);

    expect(errorDetails.code).toBe("404");
    expect(errorDetails.type).toBe("not_found");
    expect(errorDetails.userMessage).toBe("No events found for this date.");
  });

  it("should extract error names for specific error types", () => {
    const error = new TypeError("Failed to fetch");
    const errorDetails = getErrorDetails(error);

    expect(errorDetails.code).toBe("TypeError");
    expect(errorDetails.type).toBe("network");
  });

  it("should classify rate limit errors correctly", () => {
    const error = new Error("HTTP error! status: 429");
    const errorDetails = getErrorDetails(error);

    expect(errorDetails.type).toBe("rate_limit");
    expect(errorDetails.code).toBe("429");
    expect(errorDetails.userMessage).toBe(
      "Too many requests. Please wait a moment and try again.",
    );
  });

  it("should classify permission errors correctly", () => {
    const error = new Error("HTTP error! status: 401");
    const errorDetails = getErrorDetails(error);

    expect(errorDetails.type).toBe("permission");
    expect(errorDetails.code).toBe("401");
    expect(errorDetails.userMessage).toBe(
      "Access denied. Please check your permissions.",
    );
  });

  it("should classify server errors correctly", () => {
    const error = new Error("HTTP error! status: 500");
    const errorDetails = getErrorDetails(error);

    expect(errorDetails.type).toBe("server_error");
    expect(errorDetails.code).toBe("500");
    expect(errorDetails.userMessage).toBe(
      "Server error. Please try again later.",
    );
  });

  it("should classify timeout errors correctly", () => {
    const error = new Error("Request timeout");
    const errorDetails = getErrorDetails(error);

    expect(errorDetails.type).toBe("timeout");
    expect(errorDetails.userMessage).toBe(
      "Request timed out. Please try again.",
    );
  });

  it("should classify AbortError correctly", () => {
    const error = new Error("The operation was aborted");
    error.name = "AbortError";
    const errorDetails = getErrorDetails(error);

    expect(errorDetails.type).toBe("cancelled");
    expect(errorDetails.code).toBe("AbortError");
    expect(errorDetails.userMessage).toBe("Request was cancelled.");
  });
});
