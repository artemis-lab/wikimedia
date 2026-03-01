import type { Event } from "../types";

const compareByYearAscending = (event1: Event, event2: Event): number => {
  return event1.year - event2.year;
};

const compareByYearDescending = (event1: Event, event2: Event): number => {
  return event2.year - event1.year;
};

export { compareByYearAscending, compareByYearDescending };
