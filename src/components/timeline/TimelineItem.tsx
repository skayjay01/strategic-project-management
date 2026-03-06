import { useDraggable } from '@dnd-kit/core';
import type { TimelineItem as TimelineItemType } from '../../types';
import { useProjectStore } from '../../store/useProjectStore';
import {
  COLUMN_WIDTHS,
  ROW_HEIGHT,
  getColumnIndex,
  getSpanInColumns,
} from '../../lib/timelineUtils';
import { useMemo } from 'react';

interface Props {
  item: TimelineItemType;
}

export default function TimelineItem({ item }: Props) {
  const viewMode = useProjectStore((s) => s.viewMode);
  const timelineStartDate = useProjectStore((s) => s.timelineStartDate);
  const card = useProjectStore((s) => s.getCardById(item.projectId));

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

  if (!card) return null;

  const colWidth = COLUMN_WIDTHS[viewMode];
  const colIndex = getColumnIndex(item.startDate, startDate, viewMode);
  const span = getSpanInColumns(item.startDate, item.endDate, viewMode);

  const left = colIndex * colWidth;
  const width = span * colWidth;
  const top = item.row * ROW_HEIGHT + 4;

  if (colIndex + span < 0 || colIndex >= 90) return null;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        absolute rounded-md px-2 py-1 cursor-grab active:cursor-grabbing
        flex items-center gap-1 overflow-hidden select-none
        transition-shadow duration-150
        hover:shadow-md hover:brightness-105
        ${isDragging ? 'opacity-50 shadow-lg z-50' : 'z-10'}
      `}
      style={{
        left,
        width: Math.max(width, colWidth),
        top,
        height: ROW_HEIGHT - 8,
        backgroundColor: card.color,
      }}
    >
      <span className="text-xs font-semibold text-white truncate">
        {card.title}
      </span>
      <span className="text-[10px] text-white/70 shrink-0">
        {card.duration}d
      </span>
    </div>
  );
}
