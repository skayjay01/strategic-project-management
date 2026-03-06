import { useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import {
  generateColumns,
  COLUMN_WIDTHS,
  ROW_HEIGHT,
  isToday,
} from '../../lib/timelineUtils';

export default function TimelineRow() {
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
    <div className="flex">
      {columns.map((date, i) => (
        <div
          key={i}
          className={`shrink-0 border-r border-b border-slate-100 ${isToday(date) ? 'bg-blue-50/30' : ''}`}
          style={{ width: colWidth, height: ROW_HEIGHT }}
        />
      ))}
    </div>
  );
}
