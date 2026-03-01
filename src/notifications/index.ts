import dayjs from "dayjs";

import type { Notification } from "../types";

const createEmptyResultNotification = (date: dayjs.Dayjs): Notification => ({
  message: `No birthdays found for ${date.format(
    "MMMM DD",
  )}. Try another date!`,
  title: "No results",
});

export { createEmptyResultNotification };
