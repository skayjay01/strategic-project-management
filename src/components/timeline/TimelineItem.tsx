import { useCallback, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { TimelineItem as TimelineItemType } from '../../types';
import { useProjectStore } from '../../store/useProjectStore';
import {
  COLUMN_WIDTHS,
  COLUMN_COUNT,
  ROW_HEIGHT,
  getColumnIndex,
} from '../../lib/timelineUtils';
import { useMemo } from 'react';
import { differenceInDays, parseISO, format, addDays } from 'date-fns';

interface Props {
  item: TimelineItemType;
}

export default function TimelineItem({ item }: Props) {
  const viewMode = useProjectStore((s) => s.viewMode);
  const timelineStartDate = useProjectStore((s) => s.timelineStartDate);
  const card = useProjectStore((s) => s.getCardById(item.projectId));
  const updateCard = useProjectStore((s) => s.updateCard);

  const resizeRef = useRef<{
    startX: number;
    startDuration: number;
  } | null>(null);

  const startDate = useMemo(
    () => new Date(timelineStartDate + 'T00:00:00'),
    [timelineStartDate]
  );

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `timeline-${item.id}`,
    data: {
      type: 'timeline-item',
      itemId: item.id,
      projectId: item.projectId,
    },
  });

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!card) return;

      resizeRef.current = { startX: e.clientX, startDuration: card.duration };

      const colWidth = COLUMN_WIDTHS[viewMode];
      // px per day depends on view mode
      const pxPerDay = viewMode === 'day' ? colWidth
        : viewMode === 'week' ? colWidth / 7
        : colWidth / 30;

      const onMove = (moveEvent: PointerEvent) => {
        if (!resizeRef.current) return;
        const dx = moveEvent.clientX - resizeRef.current.startX;
        const daysDelta = Math.round(dx / pxPerDay);
        const newDuration = Math.max(1, resizeRef.current.startDuration + daysDelta);

        // Live preview: update the timeline item's end date directly
        const newEndDate = format(addDays(parseISO(item.startDate), newDuration), 'yyyy-MM-dd');
        useProjectStore.setState((state) => ({
          timelineItems: state.timelineItems.map((i) =>
            i.id === item.id ? { ...i, endDate: newEndDate } : i
          ),
        }));
      };

      const onUp = (upEvent: PointerEvent) => {
        if (!resizeRef.current) return;
        const dx = upEvent.clientX - resizeRef.current.startX;
        const daysDelta = Math.round(dx / pxPerDay);
        const newDuration = Math.max(1, resizeRef.current.startDuration + daysDelta);
        resizeRef.current = null;

        if (newDuration !== card.duration) {
          updateCard(card.id, { duration: newDuration });
        }

        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [card, item, viewMode, updateCard]
  );

  if (!card) return null;

  const colWidth = COLUMN_WIDTHS[viewMode];
  const colStart = getColumnIndex(item.startDate, startDate, viewMode);
  const colEnd = getColumnIndex(item.endDate, startDate, viewMode);

  const left = colStart * colWidth;
  const width = Math.max((colEnd - colStart) * colWidth, 8);
  const top = item.row * ROW_HEIGHT + 4;

  if (colEnd < 0 || colStart >= COLUMN_COUNT) return null;

  const currentDuration = differenceInDays(parseISO(item.endDate), parseISO(item.startDate));

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={`${card.title} (${currentDuration}d)\n${item.startDate} — ${item.endDate}`}
      className={`
        group/item absolute rounded-md px-2 py-1 cursor-grab active:cursor-grabbing
        flex items-center gap-1 overflow-hidden select-none
        transition-shadow duration-150
        hover:shadow-md hover:brightness-105
        ${isDragging ? 'opacity-50 shadow-lg z-50' : 'z-10'}
      `}
      style={{
        left,
        width,
        top,
        height: ROW_HEIGHT - 8,
        backgroundColor: card.color,
      }}
    >
      <span className="text-xs font-semibold text-white truncate">
        {card.title}
      </span>
      <span className="text-[10px] text-white/70 shrink-0">
        {currentDuration}d
      </span>
      {/* Resize handle */}
      <div
        onPointerDown={handleResizeStart}
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover/item:opacity-100 transition-opacity"
        style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
      />
    </div>
  );
}
