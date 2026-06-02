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
    <div className="flex border-b border-[var(--line-strong)] bg-[var(--paper-raised)] sticky top-0 z-20">
      {columns.map((date, i) => {
        const today = isToday(date);
        return (
          <div
            key={i}
            className={`
              shrink-0 border-r border-[var(--line)] text-center py-2
              ${today ? 'bg-[var(--clay-soft)]' : ''}
            `}
            style={{ width: colWidth }}
          >
            <div className={`text-[11px] font-semibold tracking-wide ${today ? 'text-[var(--clay-deep)]' : 'text-[var(--ink-2)]'}`}>
              {formatColumnHeader(date, viewMode)}
            </div>
            {viewMode !== 'month' && (
              <div className={`font-mono-num text-[9px] mt-0.5 ${today ? 'text-[var(--clay)]' : 'text-[var(--ink-faint)]'}`}>
                {formatColumnSubHeader(date, viewMode)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
