import { Pagination, ScrollArea, Switch, Table, Text } from "@mantine/core";
import { type ChangeEvent, useCallback, useMemo } from "react";

import {
  EVENTS_PER_PAGE_LIMIT,
  SCROLL_AREA_HEIGHT,
  UI_STRINGS,
} from "../../constants";
import { compareByYearAscending, compareByYearDescending } from "../../sort";
import {
  selectActivePage,
  selectEvents,
  selectIsDescendingOrder,
  setActivePage,
  setIsDescendingOrder,
} from "../../store/eventsSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { Event, PaginationData } from "../../types";

const EventsList = () => {
  const dispatch = useAppDispatch();
  const activePage = useAppSelector(selectActivePage);
  const events = useAppSelector(selectEvents);
  const isDescendingOrder = useAppSelector(selectIsDescendingOrder);

  const sortedEvents = useMemo(() => {
    return [...events].sort(
      isDescendingOrder ? compareByYearDescending : compareByYearAscending,
    );
  }, [events, isDescendingOrder]);

  const paginationData: PaginationData = useMemo(() => {
    const total = sortedEvents.length;
    const totalPages = Math.ceil(total / EVENTS_PER_PAGE_LIMIT);
    const startIndex = EVENTS_PER_PAGE_LIMIT * (activePage - 1);
    const endIndex = Math.min(total, EVENTS_PER_PAGE_LIMIT * activePage);
    const paginationMessage = `Showing ${
      startIndex + 1
    }–${endIndex} of ${total}`;

    return { endIndex, paginationMessage, startIndex, total, totalPages };
  }, [sortedEvents.length, activePage]);

  const rows = useMemo(
    () =>
      sortedEvents
        .slice(paginationData.startIndex, paginationData.endIndex)
        .map((event: Event) => (
          <Table.Tr key={`${event.text}-${event.year}`}>
            <Table.Td>{event.text}</Table.Td>
            <Table.Td>{event.year}</Table.Td>
          </Table.Tr>
        )),
    [sortedEvents, paginationData.startIndex, paginationData.endIndex],
  );

  const switchLabel = useMemo(
    () =>
      `${UI_STRINGS.SORT_BY_BIRTH_YEAR} (${
        isDescendingOrder
          ? UI_STRINGS.SORT_NEWEST_TO_OLDEST
          : UI_STRINGS.SORT_OLDEST_TO_NEWEST
      })`,
    [isDescendingOrder],
  );

  const handleSwitchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(setIsDescendingOrder(event.currentTarget.checked));
    },
    [dispatch],
  );

  const handlePageChange = useCallback(
    (value: number) => {
      dispatch(setActivePage(value));
    },
    [dispatch],
  );

  return (
    <>
      <div className="align-items-center align-self-flex-end display-flex flex-row">
        <Switch
          checked={isDescendingOrder}
          label={switchLabel}
          onChange={handleSwitchChange}
        />
      </div>
      <ScrollArea h={SCROLL_AREA_HEIGHT}>
        <Table
          highlightOnHover
          stickyHeader
          striped
          aria-label={UI_STRINGS.EVENTS_TABLE_ARIA_LABEL}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{UI_STRINGS.DESCRIPTION_COLUMN}</Table.Th>
              <Table.Th w={100}>{UI_STRINGS.BIRTH_YEAR_COLUMN}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>
      <div className="align-items-center align-self-flex-end display-flex gap-4">
        <Text className="text-nowrap" size="sm">
          {paginationData.paginationMessage}
        </Text>
        <Pagination
          aria-label={UI_STRINGS.PAGINATION_ARIA_LABEL}
          total={paginationData.totalPages}
          value={activePage}
          onChange={handlePageChange}
        />
      </div>
    </>
  );
};

export default EventsList;
