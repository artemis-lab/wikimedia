import { describe, expect, it } from "vitest";

import reducer, {
  setActivePage,
  setDateAndClearEvents,
  setEvents,
  setIsDescendingOrder,
  setNotification,
} from "../../../src/store/eventsSlice";
import { type EventsState } from "../../../src/types";

describe("eventsSlice", () => {
  const previousState: EventsState = {
    activePage: 1,
    date: 123,
    events: [{ text: "a", year: 2025 }],
    isDescendingOrder: false,
    notification: {
      message: "message",
      title: "title",
    },
  };

  it("should return the initial state", () => {
    const initialState = reducer(undefined, { type: "unknown" });

    expect(initialState.activePage).toBe(1);
    expect(typeof initialState.date).toBe("number");
    expect(initialState.date).toBeGreaterThan(0); // Should be a valid timestamp
    expect(initialState.events).toEqual([]);
    expect(initialState.isDescendingOrder).toBe(true);
    expect(initialState.notification).toBe(null);
  });

  it("should set active page", () => {
    expect(reducer(previousState, setActivePage(2))).toEqual({
      activePage: 2,
      date: 123,
      events: [{ text: "a", year: 2025 }],
      isDescendingOrder: false,
      notification: {
        message: "message",
        title: "title",
      },
    });
  });

  it("should set date and clear events", () => {
    expect(reducer(previousState, setDateAndClearEvents(1234567890))).toEqual({
      activePage: 1,
      date: 1234567890,
      events: [],
      isDescendingOrder: false,
      notification: {
        message: "message",
        title: "title",
      },
    });
  });

  it("should set events", () => {
    expect(
      reducer(
        previousState,
        setEvents([
          { text: "a", year: 2020 },
          { text: "b", year: 2021 },
        ]),
      ),
    ).toEqual({
      activePage: 1,
      date: 123,
      events: [
        { text: "a", year: 2020 },
        { text: "b", year: 2021 },
      ],
      isDescendingOrder: false,
      notification: {
        message: "message",
        title: "title",
      },
    });
  });

  it("should set is descending order", () => {
    expect(reducer(previousState, setIsDescendingOrder(true))).toEqual({
      activePage: 1,
      date: 123,
      events: [{ text: "a", year: 2025 }],
      isDescendingOrder: true,
      notification: {
        message: "message",
        title: "title",
      },
    });
  });

  it("should set notification", () => {
    expect(
      reducer(
        previousState,
        setNotification({ message: "new message", title: "new title" }),
      ),
    ).toEqual({
      activePage: 1,
      date: 123,
      events: [{ text: "a", year: 2025 }],
      isDescendingOrder: false,
      notification: {
        message: "new message",
        title: "new title",
      },
    });
  });
});
