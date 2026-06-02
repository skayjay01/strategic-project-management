import { useProjectStore } from '../../store/useProjectStore';
import type { ViewMode, Assignee } from '../../types';
import { ChevronLeft, ChevronRight, Calendar, User, Zap, Flame } from 'lucide-react';

const ASSIGNEE_CONFIG: Record<Assignee, { icon: typeof Zap; fill: string; stroke: string }> = {
  Yishan: { icon: Zap, fill: '#1a1a1a', stroke: '#1a1a1a' },
  Jack: { icon: Flame, fill: '#f97316', stroke: '#f97316' },
};

const ASSIGNEE_OPTIONS: Assignee[] = ['Jack', 'Yishan'];

const viewModes: { value: ViewMode; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

export default function TimelineControls() {
  const viewMode = useProjectStore((s) => s.viewMode);
  const setViewMode = useProjectStore((s) => s.setViewMode);
  const navigateTimeline = useProjectStore((s) => s.navigateTimeline);
  const goToToday = useProjectStore((s) => s.goToToday);
  const assigneeFilter = useProjectStore((s) => s.assigneeFilter);
  const setAssigneeFilter = useProjectStore((s) => s.setAssigneeFilter);

  const seg = (active: boolean) =>
    `px-3.5 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
      active
        ? 'bg-[var(--ink)] text-[var(--paper-raised)] shadow-[0_1px_2px_rgba(33,29,22,0.25)]'
        : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
    }`;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--line-strong)] bg-[var(--paper-raised)] reveal-fade">
      <div className="flex items-center gap-0.5 bg-[var(--paper-sunk)] rounded-lg p-1">
        {viewModes.map((mode) => (
          <button key={mode.value} onClick={() => setViewMode(mode.value)} className={seg(viewMode === mode.value)}>
            {mode.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-0.5">
        <button
          onClick={() => navigateTimeline('left')}
          aria-label="Earlier"
          className="p-1.5 rounded-lg text-[var(--ink-2)] hover:bg-[var(--paper-sunk)] hover:text-[var(--ink)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigateTimeline('right')}
          aria-label="Later"
          className="p-1.5 rounded-lg text-[var(--ink-2)] hover:bg-[var(--paper-sunk)] hover:text-[var(--ink)] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={goToToday}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-2)] hover:text-[var(--clay-deep)] hover:bg-[var(--clay-soft)] rounded-lg transition-colors"
      >
        <Calendar className="w-3.5 h-3.5" />
        Today
      </button>

      <div className="ml-auto flex items-center gap-2">
        <User className="w-3.5 h-3.5 text-[var(--ink-faint)]" />
        <div className="flex items-center gap-0.5 bg-[var(--paper-sunk)] rounded-lg p-1">
          <button onClick={() => setAssigneeFilter(null)} className={seg(assigneeFilter === null).replace('px-3.5', 'px-2.5')}>
            All
          </button>
          {ASSIGNEE_OPTIONS.map((name) => {
            const { icon: Icon, fill, stroke } = ASSIGNEE_CONFIG[name];
            const active = assigneeFilter === name;
            return (
              <button
                key={name}
                onClick={() => setAssigneeFilter(active ? null : name)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                  active
                    ? 'bg-[var(--ink)] text-[var(--paper-raised)] shadow-[0_1px_2px_rgba(33,29,22,0.25)]'
                    : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                }`}
              >
                <Icon className="w-3 h-3" fill={active ? '#faf7ef' : fill} stroke={active ? '#faf7ef' : stroke} />
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
