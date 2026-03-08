import { useProjectStore } from '../../store/useProjectStore';
import type { ViewMode, Assignee } from '../../types';
import { ChevronLeft, ChevronRight, Calendar, User, Zap, Flame } from 'lucide-react';

const ASSIGNEE_ICON: Record<Assignee, typeof Zap> = { Yishan: Zap, Jack: Flame };

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

  return (
    <div className="flex items-center gap-3 p-3 border-b border-slate-200 bg-white">
      <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
        {viewModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => setViewMode(mode.value)}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-md transition-all
              ${viewMode === mode.value
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'}
            `}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => navigateTimeline('left')}
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigateTimeline('right')}
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={goToToday}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
      >
        <Calendar className="w-3.5 h-3.5" />
        Today
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <User className="w-3.5 h-3.5 text-slate-400" />
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setAssigneeFilter(null)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              assigneeFilter === null
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            All
          </button>
          {ASSIGNEE_OPTIONS.map((name) => {
            const Icon = ASSIGNEE_ICON[name];
            return (
              <button
                key={name}
                onClick={() => setAssigneeFilter(assigneeFilter === name ? null : name)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  assigneeFilter === name
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-3 h-3" />
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
