import { parseISO, differenceInCalendarDays } from 'date-fns';

export type ProjectStatus = 'active' | 'upcoming' | 'done';

/** Status of a scheduled project relative to today, from its start/end dates. */
export function getStatus(startDate: string, endDate: string, today: Date = new Date()): ProjectStatus {
  const s = parseISO(startDate);
  const e = parseISO(endDate);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (t < s) return 'upcoming';
  if (t > e) return 'done';
  return 'active';
}

/** Fraction elapsed (0..1) for an active project; 0 for upcoming, 1 for done. */
export function elapsedFraction(startDate: string, endDate: string, today: Date = new Date()): number {
  const s = parseISO(startDate);
  const e = parseISO(endDate);
  const total = Math.max(1, differenceInCalendarDays(e, s));
  const gone = differenceInCalendarDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), s);
  return Math.min(1, Math.max(0, gone / total));
}

/** Whole days from today until start (upcoming) or until end (active). Negative past. */
export function daysUntil(dateStr: string, today: Date = new Date()): number {
  return differenceInCalendarDays(parseISO(dateStr), new Date(today.getFullYear(), today.getMonth(), today.getDate()));
}

export const STATUS_META: Record<ProjectStatus, { label: string; color: string; soft: string; order: number }> = {
  active:   { label: 'Active now', color: '#16a34a', soft: 'rgba(22,163,74,0.14)',  order: 0 },
  upcoming: { label: 'Upcoming',   color: '#c2562f', soft: 'rgba(194,86,47,0.14)',  order: 1 },
  done:     { label: 'Done',       color: '#8c8270', soft: 'rgba(140,130,112,0.16)', order: 2 },
};
