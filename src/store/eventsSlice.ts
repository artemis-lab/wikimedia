import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";

import type { Event, EventsState, Notification } from "../types";
import type { RootState } from "./store";

const initialState: EventsState = {
  activePage: 1,
  date: dayjs().valueOf(), // Current date timestamp
  events: [],
  isDescendingOrder: true,
  notification: null, // No notification initially
};

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    // Compound action for common patterns
    resetEventsState: (state) => {
      state.activePage = 1;
      state.events = [];
      state.notification = null;
    },
    setActivePage: (state, action: PayloadAction<number>) => {
      if (action.payload < 1) {
        console.warn("Invalid page number, must be >= 1:", action.payload);
        return;
      }
      state.activePage = action.payload;
    },
    // Compound action for common patterns
    setDateAndClearEvents: (state, action: PayloadAction<number>) => {
      if (action.payload < 0) {
        console.warn("Invalid date timestamp, must be >= 0:", action.payload);
        return;
      }
      state.activePage = 1;
      state.date = action.payload;
      state.events = [];
    },
    setEvents: (state, action: PayloadAction<Event[]>) => {
      if (!Array.isArray(action.payload)) {
        console.warn("Events payload must be an array:", action.payload);
        return;
      }
      state.events = action.payload;
    },
    setIsDescendingOrder: (state, action: PayloadAction<boolean>) => {
      state.isDescendingOrder = action.payload;
    },
    setNotification: (state, action: PayloadAction<Notification>) => {
      if (
        action.payload &&
        (!action.payload.message || !action.payload.title)
      ) {
        console.warn(
          "Notification must have message and title:",
          action.payload,
        );
        return;
      }
      state.notification = action.payload;
    },
  },
});

// Action creators
/**
 * Redux action creators for events state management.
 *
 * @example
 * // Set a new page
 * dispatch(setActivePage(2));
 *
 * @example
 * // Change date and clear events atomically
 * dispatch(setDateAndClearEvents(dayjs().valueOf()));
 */
export const {
  /** Resets all events state to initial values (events, page, notification) */
  resetEventsState,
  /** Sets the active page number for pagination (validates >= 1) */
  setActivePage,
  /** Sets date and clears events/page atomically (validates >= 0) */
  setDateAndClearEvents,
  /** Sets the events array (validates array type) */
  setEvents,
  /** Sets the sort order preference (true = descending, false = ascending) */
  setIsDescendingOrder,
  /** Sets the notification to display in modal (validates required fields) */
  setNotification,
} = eventsSlice.actions;

// Selectors
/**
 * Selects the current active page number for pagination
 * @param state - Root Redux state
 * @returns Current page number (1-based)
 */
export const selectActivePage = (state: RootState) => state.events.activePage;

/**
 * Selects the currently selected date timestamp
 * @param state - Root Redux state
 * @returns Unix timestamp of the selected date
 */
export const selectDate = (state: RootState) => state.events.date;

/**
 * Selects the array of loaded events/birthdays
 * @param state - Root Redux state
 * @returns Array of Event objects
 */
export const selectEvents = (state: RootState) => state.events.events;

/**
 * Selects the current sort order preference
 * @param state - Root Redux state
 * @returns True for descending (newest first), false for ascending (oldest first)
 */
export const selectIsDescendingOrder = (state: RootState) =>
  state.events.isDescendingOrder;

/**
 * Selects the current notification to display in modal
 * @param state - Root Redux state
 * @returns Notification object with title and message, or null if no notification
 */
export const selectNotification = (state: RootState) =>
  state.events.notification;

// Default export
export default eventsSlice.reducer;
