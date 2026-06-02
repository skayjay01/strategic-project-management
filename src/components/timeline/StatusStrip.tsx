import { useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { getStatus, STATUS_META, type ProjectStatus } from '../../lib/status';
import { VARIANT } from '../../variant';
import { Zap, Flame } from 'lucide-react';
import type { Assignee } from '../../types';

const ASSIGNEE_ICON: Record<Assignee, typeof Zap> = { Yishan: Zap, Jack: Flame };

interface Row { id: string; title: string; color: string; status: ProjectStatus; assignees: Assignee[]; }

export default function StatusStrip() {
  const timelineItems = useProjectStore((s) => s.timelineItems);
  const cards = useProjectStore((s) => s.cards);
  const assigneeFilter = useProjectStore((s) => s.assigneeFilter);

  const { rows, counts } = useMemo(() => {
    const rows: Row[] = [];
    for (const item of timelineItems) {
      const card = cards.find((c) => c.id === item.projectId);
      if (!card) continue;
      if (assigneeFilter && !card.assignees?.includes(assigneeFilter)) continue;
      rows.push({
        id: item.id, title: card.title, color: card.color,
        status: getStatus(item.startDate, item.endDate),
        assignees: card.assignees ?? [],
      });
    }
    const counts = { active: 0, upcoming: 0, done: 0 } as Record<ProjectStatus, number>;
    rows.forEach((r) => { counts[r.status]++; });
    return { rows, counts };
  }, [timelineItems, cards, assigneeFilter]);

  const active = rows.filter((r) => r.status === 'active');

  // ---- Variant: Spotlight — light up what's running now ----
  if (VARIANT === 'spotlight') {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--line)] bg-[var(--paper-panel)] reveal-fade overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: STATUS_META.active.color, animation: 'today-pulse 2s ease-in-out infinite' }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: STATUS_META.active.color }} />
          </span>
          <span className="eyebrow text-[var(--ink-2)]">Right now</span>
          <span className="font-mono-num text-xs text-[var(--ink-soft)]">{counts.active} running</span>
        </div>
        <div className="h-5 w-px bg-[var(--line-strong)] shrink-0" />
        <div className="flex items-center gap-2 min-w-0">
          {active.length === 0 && (
            <span className="text-xs italic text-[var(--ink-faint)]">Nothing scheduled for today.</span>
          )}
          {active.map((r) => (
            <span key={r.id} className="inline-flex items-center gap-1.5 shrink-0 pl-2 pr-2.5 py-1 rounded-full bg-[var(--paper-raised)] ring-1 ring-[var(--line-strong)] shadow-sm">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="font-ui text-xs font-semibold text-[var(--ink)] whitespace-nowrap">{r.title}</span>
              {r.assignees.map((a) => { const I = ASSIGNEE_ICON[a]; return <I key={a} className="w-3 h-3 text-[var(--ink-soft)]" />; })}
            </span>
          ))}
        </div>
        <div className="ml-auto shrink-0 font-mono-num text-[11px] text-[var(--ink-faint)] whitespace-nowrap">
          {counts.upcoming} upcoming · {counts.done} done
        </div>
      </div>
    );
  }

  // ---- Variant: Status Board — labelled legend with counts ----
  if (VARIANT === 'board') {
    const order: ProjectStatus[] = ['active', 'upcoming', 'done'];
    return (
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[var(--line)] bg-[var(--paper-panel)] reveal-fade">
        <span className="eyebrow text-[var(--ink-faint)] mr-1">Legend</span>
        {order.map((st) => (
          <span key={st} className="inline-flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-lg" style={{ backgroundColor: STATUS_META[st].soft }}>
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: STATUS_META[st].color }} />
            <span className="text-xs font-semibold text-[var(--ink-2)]">{STATUS_META[st].label}</span>
            <span className="font-mono-num text-xs font-bold" style={{ color: STATUS_META[st].color }}>{counts[st]}</span>
          </span>
        ))}
        <span className="ml-auto eyebrow text-[var(--ink-faint)]">Grouped by state →</span>
      </div>
    );
  }

  // ---- Variant: Progress — big KPI tiles ----
  const order: ProjectStatus[] = ['active', 'upcoming', 'done'];
  return (
    <div className="flex items-stretch gap-3 px-4 py-3 border-b border-[var(--line)] bg-[var(--paper-panel)] reveal-fade">
      {order.map((st) => (
        <div key={st} className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-[var(--paper-raised)] ring-1 ring-[var(--line-strong)]">
          <div className="font-display text-3xl font-semibold leading-none" style={{ color: STATUS_META[st].color }}>
            {counts[st]}
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-[var(--ink-2)]">{STATUS_META[st].label}</div>
            <div className="eyebrow text-[9px] text-[var(--ink-faint)]">projects</div>
          </div>
        </div>
      ))}
    </div>
  );
}
