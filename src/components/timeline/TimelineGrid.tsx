import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useDndContext } from '@dnd-kit/core';
import { useProjectStore } from '../../store/useProjectStore';
import TimelineRow from './TimelineRow';
import TimelineItemComponent from './TimelineItem';
import {
  COLUMN_WIDTHS,
  COLUMN_COUNT,
  ROW_HEIGHT,
  getTodayColumnIndex,
  dateFromGridPixel,
} from '../../lib/timelineUtils';
import { format } from 'date-fns';

export default function TimelineGrid() {
  const timelineItems = useProjectStore((s) => s.timelineItems);
  const viewMode = useProjectStore((s) => s.viewMode);
  const timelineStartDate = useProjectStore((s) => s.timelineStartDate);
  const { active } = useDndContext();
  const [indicator, setIndicator] = useState<{ x: number; row: number; date: string } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  const startDate = useMemo(
    () => new Date(timelineStartDate + 'T00:00:00'),
    [timelineStartDate]
  );

  useEffect(() => {
    const el = gridRef.current?.parentElement;
    if (!el) return;
    const measure = () => setContainerHeight(el.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const maxRow = timelineItems.reduce((max, item) => Math.max(max, item.row), -1);
  const minRowsFromHeight = Math.max(1, Math.floor(containerHeight / ROW_HEIGHT));
  const rowCount = Math.max(minRowsFromHeight, maxRow + 2);
  const colWidth = COLUMN_WIDTHS[viewMode];
  const totalWidth = colWidth * COLUMN_COUNT;

  const todayIndex = getTodayColumnIndex(startDate, viewMode);
  const showTodayLine = todayIndex >= 0 && todayIndex < COLUMN_COUNT;

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!active) return;
      const gridEl = e.currentTarget;
      const gridRect = gridEl.getBoundingClientRect();
      const xInGrid = e.clientX - gridRect.left;
      const yInGrid = e.clientY - gridRect.top;
      const row = Math.max(0, Math.floor(yInGrid / ROW_HEIGHT));
      const date = dateFromGridPixel(xInGrid, startDate, viewMode);

      // Snap indicator to exact day position
      const pxPerDay = viewMode === 'day' ? colWidth
        : viewMode === 'week' ? colWidth / 7
        : colWidth / 30;
      const snappedX = Math.round(xInGrid / pxPerDay) * pxPerDay;

      setIndicator({ x: snappedX, row, date });
    },
    [active, startDate, viewMode, colWidth]
  );

  const handlePointerLeave = useCallback(() => {
    setIndicator(null);
  }, []);

  useEffect(() => {
    if (!active) setIndicator(null);
  }, [active]);

  return (
    <div
      ref={gridRef}
      data-timeline-grid
      className="relative"
      style={{ width: totalWidth, minHeight: containerHeight || undefined }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
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

      {active && indicator && (
        <>
          {/* Vertical drop indicator line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-30 pointer-events-none"
            style={{ left: indicator.x }}
          />
          {/* Row highlight */}
          <div
            className="absolute left-0 right-0 bg-blue-100/30 z-0 pointer-events-none"
            style={{ top: indicator.row * ROW_HEIGHT, height: ROW_HEIGHT }}
          />
          {/* Date label */}
          <div
            className="absolute z-30 pointer-events-none bg-blue-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded -translate-x-1/2"
            style={{ left: indicator.x, top: indicator.row * ROW_HEIGHT - 20 }}
          >
            {format(new Date(indicator.date + 'T00:00:00'), 'MMM d, yyyy')}
          </div>
        </>
      )}
    </div>
  );
}
