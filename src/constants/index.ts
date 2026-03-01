const EVENT_TYPES = {
  BIRTHS: "births",
  DEATHS: "deaths",
  EVENTS: "events",
  HOLIDAYS: "holidays",
} as const;

const EVENTS_PER_PAGE_LIMIT = 15;

const ON_THIS_DAY_WIKIMEDIA_API_URL =
  "https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/{type}/{MM}/{DD}";

const SCROLL_AREA_HEIGHT = 600;

const UI_STRINGS = {
  BIRTH_YEAR_COLUMN: "Birth year",
  CLOSE: "Close",
  DESCRIPTION_COLUMN: "Description of the person",
  ERROR_TITLE: "Error loading birthdays",
  EVENTS_TABLE_ARIA_LABEL: "Historical events",
  LOADING_ARIA_LABEL: "Loading historical events",
  ON_THIS_DAY: "On this day",
  PAGINATION_ARIA_LABEL: "Navigate through birthday results",
  SELECT_DATE_ARIA_LABEL: "Select date to view birthdays",
  SHOW_BIRTHDAYS: "Show birthdays",
  SORT_BY_BIRTH_YEAR: "Sort by birth year",
  SORT_NEWEST_TO_OLDEST: "newest to oldest",
  SORT_OLDEST_TO_NEWEST: "oldest to newest",
} as const;

export {
  EVENT_TYPES,
  EVENTS_PER_PAGE_LIMIT,
  ON_THIS_DAY_WIKIMEDIA_API_URL,
  SCROLL_AREA_HEIGHT,
  UI_STRINGS,
};
