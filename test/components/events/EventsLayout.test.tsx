/// <reference types="@testing-library/jest-dom" />
import { screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import dayjs from "dayjs";
import { delay, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { v4 as uuidv4 } from "uuid";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { EventsLayout } from "../../../src/components/events";
import { ON_THIS_DAY_WIKIMEDIA_API_URL } from "../../../src/constants";
import { type Event, type EventsResponse } from "../../../src/types";
import renderWithProviders from "../helpers/renderWithProviders";

const events: Event[] = [];
for (let i = 1; i <= 150; i++) {
  events.push({ text: uuidv4(), year: i });
}
const emptyEventsResponse: EventsResponse = { births: [] };
const eventsResponse: EventsResponse = { births: events };

const url = ON_THIS_DAY_WIKIMEDIA_API_URL.replace("{type}", ":type")
  .replace("{MM}", ":month")
  .replace("{DD}", ":day");

const handlers = [
  http.get(url, async () => {
    await delay(200);
    return HttpResponse.json(eventsResponse);
  }),
  http.get(url, async () => {
    await delay(200);
    return HttpResponse.error();
  }),
  http.get(url, async () => {
    await delay(200);
    return HttpResponse.json(emptyEventsResponse);
  }),
];
const server = setupServer(...handlers);

describe("EventsLayout", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it("should initially render page without events", async () => {
    renderWithProviders(<EventsLayout />);

    const date = dayjs();
    expect(screen.getByText("On this day")).toBeInTheDocument();
    expect(screen.getByText(date.format("MMMM DD"))).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show birthdays" }),
    ).toBeInTheDocument();

    expect(screen.queryByRole("table")).toBeNull();
    expect(
      screen.queryByText("Sort by birth year (newest to oldest)"),
    ).toBeNull();
    expect(screen.queryByText("Description of the person")).toBeNull();
    expect(screen.queryByText("Birth year")).toBeNull();
    expect(screen.queryByText(/Showing/)).toBeNull();
  });

  it("should show loading component after button clicked", async () => {
    renderWithProviders(<EventsLayout />);

    await user.click(screen.getByRole("button", { name: "Show birthdays" }));

    expect(
      await screen.findByTestId("events-layout-loader"),
    ).toBeInTheDocument();
  });

  it("should show events in descending order after button clicked", async () => {
    renderWithProviders(<EventsLayout />);

    await user.click(screen.getByRole("button", { name: "Show birthdays" }));

    const date = dayjs();
    expect(screen.getByText("On this day")).toBeInTheDocument();
    expect(screen.getByText(date.format("MMMM DD"))).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show birthdays" }),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Sort by birth year (newest to oldest)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Description of the person")).toBeInTheDocument();
    expect(screen.getByText("Birth year")).toBeInTheDocument();
    expect(screen.getByText("Showing 1–15 of 150")).toBeInTheDocument();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");

    expect(rows[1]).toBeDefined();
    const cells = within(rows[1]!).getAllByRole("cell");

    expect(rows.length).toBe(16);
    expect(cells[1]).toHaveTextContent(/^150$/);
  });

  it("should allow ordering events by year", async () => {
    renderWithProviders(<EventsLayout />);

    await user.click(screen.getByRole("button", { name: "Show birthdays" }));
    let table = await screen.findByRole("table");
    let rows = within(table).getAllByRole("row");

    expect(rows[1]).toBeDefined();
    let cells = within(rows[1]!).getAllByRole("cell");

    expect(cells[1]).toHaveTextContent(/^150$/);

    await user.click(
      screen.getByRole("switch", {
        name: "Sort by birth year (newest to oldest)",
      }),
    );

    table = await screen.findByRole("table");
    rows = within(table).getAllByRole("row");

    expect(rows[1]).toBeDefined();
    cells = within(rows[1]!).getAllByRole("cell");

    expect(
      screen.getByRole("switch", {
        name: "Sort by birth year (oldest to newest)",
      }),
    ).toBeInTheDocument();
    expect(cells[1]).toHaveTextContent(/^1$/);
  });

  it("should allow switching between ordering of events by year", async () => {
    renderWithProviders(<EventsLayout />);

    await user.click(screen.getByRole("button", { name: "Show birthdays" }));
    let table = await screen.findByRole("table");
    let rows = within(table).getAllByRole("row");

    expect(rows[1]).toBeDefined();
    let cells = within(rows[1]!).getAllByRole("cell");

    expect(cells[1]).toHaveTextContent(/^150$/);

    await user.click(
      screen.getByRole("switch", {
        name: "Sort by birth year (newest to oldest)",
      }),
    );

    table = await screen.findByRole("table");
    rows = within(table).getAllByRole("row");

    expect(rows[1]).toBeDefined();
    cells = within(rows[1]!).getAllByRole("cell");

    expect(cells[1]).toHaveTextContent(/^1$/);

    await user.click(
      screen.getByRole("switch", {
        name: "Sort by birth year (oldest to newest)",
      }),
    );

    table = await screen.findByRole("table");
    rows = within(table).getAllByRole("row");

    expect(rows[1]).toBeDefined();
    cells = within(rows[1]!).getAllByRole("cell");

    expect(cells[1]).toHaveTextContent(/^150$/);
  });

  it("should allow pagination of events", async () => {
    renderWithProviders(<EventsLayout />);

    await user.click(screen.getByRole("button", { name: "Show birthdays" }));
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: /^2$/ }));

    let table = await screen.findByRole("table");
    let rows = within(table).getAllByRole("row");

    expect(rows[1]).toBeDefined();
    let cells = within(rows[1]!).getAllByRole("cell");

    expect(cells[1]).toHaveTextContent(/^135$/);
    expect(screen.getByText("Showing 16–30 of 150")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^5$/ }));

    table = await screen.findByRole("table");
    rows = within(table).getAllByRole("row");

    expect(rows[1]).toBeDefined();
    cells = within(rows[1]!).getAllByRole("cell");

    expect(cells[1]).toHaveTextContent(/^90$/);
    expect(screen.getByText("Showing 61–75 of 150")).toBeInTheDocument();
  });

  it("should show modal dialog if events data loading failed", async () => {
    renderWithProviders(<EventsLayout />);

    expect(handlers[1]).toBeDefined();
    server.use(handlers[1]!);
    await user.click(screen.getByRole("button", { name: "Show birthdays" }));

    expect(
      await screen.findByText("Error loading birthdays"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Network connection failed. Please check your internet connection.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("should show modal dialog if no events found", async () => {
    renderWithProviders(<EventsLayout />);

    expect(handlers[2]).toBeDefined();
    server.use(handlers[2]!);

    await user.click(screen.getByRole("button", { name: "Show birthdays" }));

    const date = dayjs();

    expect(await screen.findByText("No results")).toBeInTheDocument();
    expect(
      screen.getByText(
        `No birthdays found for ${date.format("MMMM DD")}. Try another date!`,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
