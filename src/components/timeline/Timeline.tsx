import { useRef, useEffect, useMemo, useCallback } from 'react';
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
  const panRef = useRef<{ active: boolean; startX: number; scrollStart: number } | null>(null);
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

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only pan on left click on the background (not on draggable items)
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-draggable]')) return;
    if (!scrollRef.current) return;

    panRef.current = {
      active: true,
      startX: e.clientX,
      scrollStart: scrollRef.current.scrollLeft,
    };
    scrollRef.current.style.cursor = 'grabbing';
    e.preventDefault();
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!panRef.current?.active || !scrollRef.current) return;
    const dx = e.clientX - panRef.current.startX;
    scrollRef.current.scrollLeft = panRef.current.scrollStart - dx;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!panRef.current) return;
    panRef.current = null;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = '';
    }
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
