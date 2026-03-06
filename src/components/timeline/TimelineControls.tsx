import { useProjectStore } from '../../store/useProjectStore';
import type { ViewMode } from '../../types';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const viewModes: { value: ViewMode; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

export default function TimelineControls() {
  const viewMode = useProjectStore((s) => s.viewMode);
  const setViewMode = useProjectStore((s) => s.setViewMode);
  const navigateTimeline = useProjectStore((s) => s.navigateTimeline);
  const goToToday = useProjectStore((s) => s.goToToday);

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
    </div>
  );
}
