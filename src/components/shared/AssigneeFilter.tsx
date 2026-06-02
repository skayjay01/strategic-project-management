import { useProjectStore } from '../../store/useProjectStore';
import { Zap, Flame } from 'lucide-react';
import type { Assignee } from '../../types';

const ASSIGNEE_CONFIG: Record<Assignee, { icon: typeof Zap; fill: string; stroke: string }> = {
  Yishan: { icon: Zap, fill: '#1a1a1a', stroke: '#1a1a1a' },
  Jack: { icon: Flame, fill: '#f97316', stroke: '#f97316' },
};
const OPTIONS: Assignee[] = ['Jack', 'Yishan'];

export default function AssigneeFilter({ dark = false }: { dark?: boolean }) {
  const assigneeFilter = useProjectStore((s) => s.assigneeFilter);
  const setAssigneeFilter = useProjectStore((s) => s.setAssigneeFilter);

  const track = dark ? 'bg-white/10' : 'bg-[var(--paper-sunk)]';
  const activeCls = dark ? 'bg-white text-[#211d16]' : 'bg-[var(--ink)] text-[var(--paper-raised)]';
  const idleCls = dark ? 'text-white/55 hover:text-white' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]';

  const btn = (active: boolean) =>
    `px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${active ? activeCls + ' shadow-sm' : idleCls}`;

  return (
    <div className={`flex items-center gap-0.5 rounded-lg p-1 ${track}`}>
      <button onClick={() => setAssigneeFilter(null)} className={btn(assigneeFilter === null)}>All</button>
      {OPTIONS.map((name) => {
        const { icon: Icon, fill, stroke } = ASSIGNEE_CONFIG[name];
        const active = assigneeFilter === name;
        const iconColor = active ? (dark ? '#211d16' : '#faf7ef') : undefined;
        return (
          <button key={name} onClick={() => setAssigneeFilter(active ? null : name)} className={`flex items-center gap-1 ${btn(active)}`}>
            <Icon className="w-3 h-3" fill={iconColor ?? fill} stroke={iconColor ?? stroke} />
            {name}
          </button>
        );
      })}
    </div>
  );
}
