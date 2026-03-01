import { Button, Center, Loader, Modal, Text } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { IconCake, IconCalendar } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo } from "react";

import { EVENT_TYPES, SCROLL_AREA_HEIGHT, UI_STRINGS } from "../../constants";
import { useLoadEvents } from "../../hooks";
import { createEmptyResultNotification } from "../../notifications";
import {
  selectDate,
  selectEvents,
  selectNotification,
  setActivePage,
  setDateAndClearEvents,
  setEvents,
  setIsDescendingOrder,
  setNotification,
} from "../../store/eventsSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import EventsList from "./EventsList";

const calendarIcon = <IconCalendar size={18} stroke={1.5} />;
const cakeIcon = <IconCake size={16} />;

const EventsLayout = () => {
  const dispatch = useAppDispatch();
  const date = useAppSelector(selectDate);
  const events = useAppSelector(selectEvents);
  const notification = useAppSelector(selectNotification);

  const { data, error, isLoading, loadEvents, resetState } = useLoadEvents();
  const [opened, { open, close }] = useDisclosure(false);

  const dateValue = useMemo(() => dayjs(date).toDate(), [date]);

  const onChangeDate = useCallback(
    (value: string | null) => {
      const currentDate = dayjs(date);
      const selectedDate = value ? dayjs(value) : dayjs();
      if (
        currentDate.date() === selectedDate.date() &&
        currentDate.month() === selectedDate.month()
      ) {
        return;
      }
      resetState(); // Reset hook's data and error state
      dispatch(setDateAndClearEvents(selectedDate.valueOf()));
    },
    [date, dispatch, resetState],
  );

  const loadBirthdays = useCallback(() => {
    const selectedDate = dayjs(date);
    const day = selectedDate.format("DD");
    const month = selectedDate.format("MM");

    loadEvents(day, month, EVENT_TYPES.BIRTHS);
  }, [date, loadEvents]);

  useEffect(() => {
    if (error) {
      dispatch(
        setNotification({
          message: error,
          title: UI_STRINGS.ERROR_TITLE,
        }),
      );
      open();
    } else if (data && data.length === 0) {
      const selectedDate = dayjs(date);
      dispatch(setNotification(createEmptyResultNotification(selectedDate)));
      open();
    }

    if (data) {
      dispatch(setActivePage(1));
      dispatch(setEvents(data));
      dispatch(setIsDescendingOrder(true));
    }
  }, [data, error, dispatch, date, open]);

  return (
    <>
      <div className="display-flex flex-column gap-4 margin-4">
        <div className="align-items-center display-flex flex-row gap-2 padding-left-2">
          <Text size="sm">{UI_STRINGS.ON_THIS_DAY}</Text>
          <DatePickerInput
            aria-label={UI_STRINGS.SELECT_DATE_ARIA_LABEL}
            className="width-40"
            disabled={isLoading}
            leftSection={calendarIcon}
            value={dateValue}
            valueFormat="MMMM DD"
            onChange={onChangeDate}
          />
          <Button
            disabled={isLoading}
            leftSection={cakeIcon}
            onClick={loadBirthdays}
          >
            {UI_STRINGS.SHOW_BIRTHDAYS}
          </Button>
        </div>
        {isLoading ? (
          <Center h={SCROLL_AREA_HEIGHT}>
            <Loader
              aria-label={UI_STRINGS.LOADING_ARIA_LABEL}
              data-testid="events-layout-loader"
              size="md"
            />
          </Center>
        ) : events.length > 0 ? (
          <EventsList />
        ) : null}
      </div>
      {notification && (
        <Modal
          aria-describedby="notification-message"
          opened={opened}
          title={notification.title}
          onClose={close}
        >
          <div className="display-flex flex-column">
            <Text id="notification-message" size="sm">
              {notification.message}
            </Text>
            <Button
              className="align-self-flex-end margin-top-4"
              onClick={close}
            >
              {UI_STRINGS.CLOSE}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default EventsLayout;
