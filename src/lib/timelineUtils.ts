import {
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  startOfMonth,
  format,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  parseISO,
} from 'date-fns';
import type { ViewMode } from '../types';

export const COLUMN_WIDTHS: Record<ViewMode, number> = {
  day: 40,
  week: 100,
  month: 150,
};

export const ROW_HEIGHT = 48;
export const COLUMN_COUNT = 90;

export function generateColumns(startDate: Date, viewMode: ViewMode): Date[] {
  const columns: Date[] = [];
  for (let i = 0; i < COLUMN_COUNT; i++) {
    switch (viewMode) {
      case 'day':
        columns.push(addDays(startDate, i));
        break;
      case 'week':
        columns.push(addWeeks(startOfWeek(startDate, { weekStartsOn: 1 }), i));
        break;
      case 'month':
        columns.push(addMonths(startOfMonth(startDate), i));
        break;
    }
  }
  return columns;
}

export function formatColumnHeader(date: Date, viewMode: ViewMode): string {
  switch (viewMode) {
    case 'day':
      return format(date, 'd');
    case 'week':
      return format(date, 'MMM d');
    case 'month':
      return format(date, 'MMM yyyy');
  }
}

export function formatColumnSubHeader(date: Date, viewMode: ViewMode): string {
  switch (viewMode) {
    case 'day':
      return format(date, 'EEE');
    case 'week':
      return 'W' + format(date, 'w');
    case 'month':
      return '';
  }
}

export function getColumnIndex(
  date: string,
  startDate: Date,
  viewMode: ViewMode
): number {
  const parsed = parseISO(date);
  switch (viewMode) {
    case 'day':
      return differenceInDays(parsed, startDate);
    case 'week':
      return differenceInWeeks(parsed, startOfWeek(startDate, { weekStartsOn: 1 }));
    case 'month':
      return differenceInMonths(parsed, startOfMonth(startDate));
  }
}

export function getSpanInColumns(
  startDateStr: string,
  endDateStr: string,
  viewMode: ViewMode
): number {
  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);
  switch (viewMode) {
    case 'day':
      return Math.max(1, differenceInDays(end, start));
    case 'week':
      return Math.max(1, Math.ceil(differenceInDays(end, start) / 7));
    case 'month':
      return Math.max(1, differenceInMonths(end, start) || 1);
  }
}

export function dateFromColumnIndex(
  index: number,
  startDate: Date,
  viewMode: ViewMode
): string {
  let date: Date;
  switch (viewMode) {
    case 'day':
      date = addDays(startDate, index);
      break;
    case 'week':
      date = addWeeks(startOfWeek(startDate, { weekStartsOn: 1 }), index);
      break;
    case 'month':
      date = addMonths(startOfMonth(startDate), index);
      break;
  }
  return format(date, 'yyyy-MM-dd');
}

export function computeEndDate(startDateStr: string, durationDays: number): string {
  return format(addDays(parseISO(startDateStr), durationDays), 'yyyy-MM-dd');
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function getTodayColumnIndex(startDate: Date, viewMode: ViewMode): number {
  const today = format(new Date(), 'yyyy-MM-dd');
  return getColumnIndex(today, startDate, viewMode);
}
