import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useProjectStore } from '../store/useProjectStore';
import { getStatus, elapsedFraction, daysUntil, type ProjectStatus } from './status';
import type { ProjectCard } from '../types';

export type RowStatus = ProjectStatus | 'unscheduled';

export interface ProjectRow {
  card: ProjectCard;
  scheduled: boolean;
  status: RowStatus;
  startDate?: string;
  endDate?: string;
  elapsed: number;   // 0..1
  daysLeft: number;  // active → days to end; upcoming → days to start; else 0
  dateLabel: string; // "Apr 3 – Jun 1" or "—"
}

export interface ProjectRowsResult {
  rows: ProjectRow[];
  counts: Record<RowStatus, number>;
  byStatus: Record<RowStatus, ProjectRow[]>;
}

/** Enriched, assignee-filtered project rows shared by every view. */
export function useProjectRows(): ProjectRowsResult {
  const cards = useProjectStore((s) => s.cards);
  const items = useProjectStore((s) => s.timelineItems);
  const filter = useProjectStore((s) => s.assigneeFilter);

  return useMemo(() => {
    const byProj = new Map(items.map((i) => [i.projectId, i] as const));
    const rows: ProjectRow[] = cards
      .filter((c) => !filter || c.assignees?.includes(filter))
      .map((card) => {
        const it = byProj.get(card.id);
        if (!it) {
          return { card, scheduled: false, status: 'unscheduled', elapsed: 0, daysLeft: 0, dateLabel: '—' };
        }
        const status = getStatus(it.startDate, it.endDate);
        const elapsed = elapsedFraction(it.startDate, it.endDate);
        const daysLeft =
          status === 'active' ? Math.max(0, daysUntil(it.endDate))
          : status === 'upcoming' ? Math.max(0, daysUntil(it.startDate))
          : 0;
        return {
          card, scheduled: true, status,
          startDate: it.startDate, endDate: it.endDate, elapsed, daysLeft,
          dateLabel: `${format(parseISO(it.startDate), 'MMM d')} – ${format(parseISO(it.endDate), 'MMM d')}`,
        };
      });

    const counts: Record<RowStatus, number> = { active: 0, upcoming: 0, done: 0, unscheduled: 0 };
    const byStatus: Record<RowStatus, ProjectRow[]> = { active: [], upcoming: [], done: [], unscheduled: [] };
    rows.forEach((r) => { counts[r.status]++; byStatus[r.status].push(r); });

    // sensible per-bucket ordering
    byStatus.active.sort((a, b) => a.daysLeft - b.daysLeft);     // ending soonest first
    byStatus.upcoming.sort((a, b) => a.daysLeft - b.daysLeft);   // starting soonest first
    byStatus.done.sort((a, b) => (b.endDate ?? '').localeCompare(a.endDate ?? '')); // most recent first

    return { rows, counts, byStatus };
  }, [cards, items, filter]);
}
