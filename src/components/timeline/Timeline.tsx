import { useRef, useEffect, useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import TimelineControls from './TimelineControls';
import TimelineHeader from './TimelineHeader';
import TimelineGrid from './TimelineGrid';
import {
  COLUMN_WIDTHS,
  getTodayColumnIndex,
} from '../../lib/timelineUtils';

export default function Timeline() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewMode = useProjectStore((s) => s.viewMode);
  const timelineStartDate = useProjectStore((s) => s.timelineStartDate);

  const startDate = useMemo(
    () => new Date(timelineStartDate + 'T00:00:00'),
    [timelineStartDate]
  );

  useEffect(() => {
    if (!scrollRef.current) return;
    const todayIndex = getTodayColumnIndex(startDate, viewMode);
    const colWidth = COLUMN_WIDTHS[viewMode];
    const scrollTo = Math.max(0, todayIndex * colWidth - scrollRef.current.clientWidth / 3);
    scrollRef.current.scrollLeft = scrollTo;
  }, [timelineStartDate, viewMode, startDate]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TimelineControls />
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto timeline-scroll"
      >
        <TimelineHeader />
        <TimelineGrid />
      </div>
    </div>
  );
}
