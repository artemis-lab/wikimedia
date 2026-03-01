import { describe, expect, it } from "vitest";

import {
  compareByYearAscending,
  compareByYearDescending,
} from "../../../src/sort/index";
import { type Event } from "../../../src/types";

describe("sort", () => {
  it("should sort events in ascending order by year", () => {
    const events: Event[] = [
      { text: "a", year: 2025 },
      { text: "b", year: 2023 },
      { text: "c", year: 2024 },
    ];
    const expectedEvents: Event[] = [
      { text: "b", year: 2023 },
      { text: "c", year: 2024 },
      { text: "a", year: 2025 },
    ];
    events.sort(compareByYearAscending);

    expect(events).toEqual(expectedEvents);
  });

  it("should sort events in descending order by year", () => {
    const events: Event[] = [
      { text: "a", year: 2025 },
      { text: "b", year: 2023 },
      { text: "c", year: 2024 },
    ];
    const expectedEvents: Event[] = [
      { text: "a", year: 2025 },
      { text: "c", year: 2024 },
      { text: "b", year: 2023 },
    ];
    events.sort(compareByYearDescending);

    expect(events).toEqual(expectedEvents);
  });
});
