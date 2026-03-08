import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import TimelineControls from './TimelineControls';
import TimelineHeader from './TimelineHeader';
import TimelineGrid from './TimelineGrid';
import {
  COLUMN_WIDTHS,
  getTodayColumnIndex,
} from '../../lib/timelineUtils';
import { addDays, format } from 'date-fns';

export default function Timeline() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{
    active: boolean;
    startX: number;
    startDateStr: string;
    lastDaysDelta: number;
  } | null>(null);
  const skipScrollRef = useRef(false);
  const viewMode = useProjectStore((s) => s.viewMode);
  const timelineStartDate = useProjectStore((s) => s.timelineStartDate);
  const setTimelineStartDate = useProjectStore((s) => s.setTimelineStartDate);

  const startDate = useMemo(
    () => new Date(timelineStartDate + 'T00:00:00'),
    [timelineStartDate]
  );

  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    if (!scrollRef.current) return;
    const todayIndex = getTodayColumnIndex(startDate, viewMode);
    const colWidth = COLUMN_WIDTHS[viewMode];
    const scrollTo = Math.max(0, todayIndex * colWidth - scrollRef.current.clientWidth / 3);
    scrollRef.current.scrollLeft = scrollTo;
  }, [timelineStartDate, viewMode, startDate]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-draggable]')) return;

    panRef.current = {
      active: true,
      startX: e.clientX,
      startDateStr: timelineStartDate,
      lastDaysDelta: 0,
    };
    document.body.style.cursor = 'grabbing';
    e.preventDefault();
  }, [timelineStartDate]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!panRef.current?.active) return;
    const dx = e.clientX - panRef.current.startX;

    const colWidth = COLUMN_WIDTHS[viewMode];
    const pxPerDay = viewMode === 'week' ? colWidth / 7 : colWidth / 30;
    const daysDelta = Math.round(-dx / pxPerDay);

    if (daysDelta === panRef.current.lastDaysDelta) return;
    panRef.current.lastDaysDelta = daysDelta;

    const baseDate = new Date(panRef.current.startDateStr + 'T00:00:00');
    const newDate = addDays(baseDate, daysDelta);
    skipScrollRef.current = true;
    setTimelineStartDate(format(newDate, 'yyyy-MM-dd'));
  }, [viewMode, setTimelineStartDate]);

  const handlePointerUp = useCallback(() => {
    if (!panRef.current) return;
    panRef.current = null;
    document.body.style.cursor = '';
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TimelineControls />
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto timeline-scroll cursor-grab"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <TimelineHeader />
        <TimelineGrid />
      </div>
    </div>
  );
}
