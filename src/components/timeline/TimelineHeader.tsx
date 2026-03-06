import { useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import {
  generateColumns,
  formatColumnHeader,
  formatColumnSubHeader,
  COLUMN_WIDTHS,
  isToday,
} from '../../lib/timelineUtils';

export default function TimelineHeader() {
  const viewMode = useProjectStore((s) => s.viewMode);
  const timelineStartDate = useProjectStore((s) => s.timelineStartDate);

  const startDate = useMemo(
    () => new Date(timelineStartDate + 'T00:00:00'),
    [timelineStartDate]
  );
  const columns = useMemo(
    () => generateColumns(startDate, viewMode),
    [startDate, viewMode]
  );
  const colWidth = COLUMN_WIDTHS[viewMode];

  return (
    <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10">
      {columns.map((date, i) => {
        const today = isToday(date);
        return (
          <div
            key={i}
            className={`
              shrink-0 border-r border-slate-100 text-center py-1.5
              ${today ? 'bg-blue-50' : ''}
            `}
            style={{ width: colWidth }}
          >
            <div className={`text-xs font-semibold ${today ? 'text-blue-600' : 'text-slate-700'}`}>
              {formatColumnHeader(date, viewMode)}
            </div>
            {viewMode !== 'month' && (
              <div className={`text-[10px] ${today ? 'text-blue-500' : 'text-slate-400'}`}>
                {formatColumnSubHeader(date, viewMode)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
