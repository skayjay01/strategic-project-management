import {
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  startOfMonth,
  format,
  differenceInDays,
  differenceInMonths,
  getDaysInMonth,
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
    case 'week': {
      const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
      return differenceInDays(parsed, weekStart) / 7;
    }
    case 'month': {
      const monthStart = startOfMonth(startDate);
      const parsedMonthStart = startOfMonth(parsed);
      const monthOffset = differenceInMonths(parsedMonthStart, monthStart);
      const dayInMonth = parsed.getDate() - 1;
      const totalDays = getDaysInMonth(parsed);
      return monthOffset + dayInMonth / totalDays;
    }
  }
}

export function calcDayFromPointerInCell(
  pointerX: number,
  cellRect: { left: number; width: number },
  cellDateStr: string,
  viewMode: ViewMode
): string {
  const posInCell = Math.max(0, Math.min(0.999, (pointerX - cellRect.left) / cellRect.width));
  const cellDate = parseISO(cellDateStr);
  if (viewMode === 'month') {
    const daysInMo = getDaysInMonth(cellDate);
    const dayOffset = Math.floor(posInCell * daysInMo);
    return format(addDays(cellDate, dayOffset), 'yyyy-MM-dd');
  }
  if (viewMode === 'week') {
    const dayOffset = Math.floor(posInCell * 7);
    return format(addDays(cellDate, dayOffset), 'yyyy-MM-dd');
  }
  return cellDateStr;
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
