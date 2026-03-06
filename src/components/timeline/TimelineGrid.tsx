import { useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import TimelineRow from './TimelineRow';
import TimelineItemComponent from './TimelineItem';
import {
  COLUMN_WIDTHS,
  COLUMN_COUNT,
  getTodayColumnIndex,
} from '../../lib/timelineUtils';

const MIN_ROWS = 5;

export default function TimelineGrid() {
  const timelineItems = useProjectStore((s) => s.timelineItems);
  const viewMode = useProjectStore((s) => s.viewMode);
  const timelineStartDate = useProjectStore((s) => s.timelineStartDate);

  const startDate = useMemo(
    () => new Date(timelineStartDate + 'T00:00:00'),
    [timelineStartDate]
  );

  const maxRow = timelineItems.reduce((max, item) => Math.max(max, item.row), -1);
  const rowCount = Math.max(MIN_ROWS, maxRow + 2);
  const colWidth = COLUMN_WIDTHS[viewMode];
  const totalWidth = colWidth * COLUMN_COUNT;

  const todayIndex = getTodayColumnIndex(startDate, viewMode);
  const showTodayLine = todayIndex >= 0 && todayIndex < COLUMN_COUNT;

  return (
    <div data-timeline-grid className="relative" style={{ width: totalWidth }}>
      {Array.from({ length: rowCount }, (_, i) => (
        <TimelineRow key={i} rowIndex={i} />
      ))}

      {timelineItems.map((item) => (
        <TimelineItemComponent key={item.id} item={item} />
      ))}

      {showTodayLine && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20 pointer-events-none"
          style={{ left: viewMode === 'day' ? todayIndex * colWidth + colWidth / 2 : todayIndex * colWidth }}
        />
      )}
    </div>
  );
}
