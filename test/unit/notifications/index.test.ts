import dayjs from "dayjs";
import { describe, expect, it } from "vitest";

import { createEmptyResultNotification } from "../../../src/notifications";

describe("notifications", () => {
  describe("createEmptyResultNotification", () => {
    it("should create notification with formatted date message", () => {
      const date = dayjs("2025-10-15");
      const notification = createEmptyResultNotification(date);

      expect(notification).toEqual({
        title: "No results",
        message: "No birthdays found for October 15. Try another date!",
      });
    });

    it("should handle different month formats correctly", () => {
      const date = dayjs("2025-01-01");
      const notification = createEmptyResultNotification(date);

      expect(notification).toEqual({
        title: "No results",
        message: "No birthdays found for January 01. Try another date!",
      });
    });

    it("should handle end of month dates correctly", () => {
      const date = dayjs("2025-12-31");
      const notification = createEmptyResultNotification(date);

      expect(notification).toEqual({
        title: "No results",
        message: "No birthdays found for December 31. Try another date!",
      });
    });

    it("should return proper Notification type structure", () => {
      const date = dayjs("2025-06-15");
      const notification = createEmptyResultNotification(date);

      expect(notification).toHaveProperty("title");
      expect(notification).toHaveProperty("message");
      expect(typeof notification.title).toBe("string");
      expect(typeof notification.message).toBe("string");
    });
  });
});
