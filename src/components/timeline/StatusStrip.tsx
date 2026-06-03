import { useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { getStatus, STATUS_META, type ProjectStatus } from '../../lib/status';

export default function StatusStrip() {
  const timelineItems = useProjectStore((s) => s.timelineItems);
  const cards = useProjectStore((s) => s.cards);
  const assigneeFilter = useProjectStore((s) => s.assigneeFilter);

  const counts = useMemo(() => {
    const counts = { active: 0, upcoming: 0, done: 0 } as Record<ProjectStatus, number>;
    for (const item of timelineItems) {
      const card = cards.find((c) => c.id === item.projectId);
      if (!card) continue;
      if (assigneeFilter && !card.assignees?.includes(assigneeFilter)) continue;
      counts[getStatus(item.startDate, item.endDate)]++;
    }
    return counts;
  }, [timelineItems, cards, assigneeFilter]);

  // Big KPI tiles — active / upcoming / done project counts at a glance.
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
