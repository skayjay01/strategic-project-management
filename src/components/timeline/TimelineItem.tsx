import { useCallback, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { TimelineItem as TimelineItemType } from '../../types';
import { useProjectStore } from '../../store/useProjectStore';
import {
  COLUMN_WIDTHS,
  COLUMN_COUNT,
  ROW_HEIGHT,
  getColumnIndex,
  measureTextWidth,
} from '../../lib/timelineUtils';
import { useMemo } from 'react';
import { differenceInDays, parseISO, format, addDays } from 'date-fns';
import { Zap, Flame } from 'lucide-react';
import type { Assignee } from '../../types';

const ASSIGNEE_CONFIG: Record<Assignee, { icon: typeof Zap; fill: string; stroke: string }> = {
  Yishan: { icon: Zap, fill: '#1a1a1a', stroke: '#1a1a1a' },
  Jack: { icon: Flame, fill: '#f97316', stroke: '#f97316' },
};

// Fonts must match the rendered classes so the fit measurement is accurate.
const TITLE_FONT = '600 12px Inter, system-ui, -apple-system, sans-serif'; // text-xs font-semibold
const DURATION_FONT = '400 10px Inter, system-ui, -apple-system, sans-serif'; // text-[10px]

interface Props {
  item: TimelineItemType;
  isOverlapping?: boolean;
}

export default function TimelineItem({ item, isOverlapping }: Props) {
  const viewMode = useProjectStore((s) => s.viewMode);
  const timelineStartDate = useProjectStore((s) => s.timelineStartDate);
  const card = useProjectStore((s) => s.getCardById(item.projectId));
  const updateCard = useProjectStore((s) => s.updateCard);
  const setEditingCardId = useProjectStore((s) => s.setEditingCardId);

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
      const pxPerDay = viewMode === 'week' ? colWidth / 7 : colWidth / 30;

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

  // Decide whether the title fits inside the bar. If not, it floats just to the
  // right of the bar so the full title is always visible, never truncated.
  const assigneeCount = card.assignees?.length ?? 0;
  const titleWidth = measureTextWidth(card.title, TITLE_FONT);
  const durationWidth = measureTextWidth(`${currentDuration}d`, DURATION_FONT);
  const iconsWidth = assigneeCount * 14; // w-3.5 icons
  const gapWidth = (assigneeCount > 0 ? 2 : 1) * 4; // gap-1 between bar children
  const reserved = 16 /* px-2 padding */ + iconsWidth + durationWidth + gapWidth + 6 /* safety */;
  const titleFitsInside = titleWidth <= width - reserved;

  return (
    <>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        data-draggable
        onDoubleClick={() => setEditingCardId(item.projectId)}
        title={`${card.title} (${currentDuration}d)\n${item.startDate} — ${item.endDate}`}
        className={`
          group/item absolute rounded-md px-2 py-1 cursor-grab active:cursor-grabbing
          flex items-center gap-1 overflow-hidden select-none
          transition-shadow duration-150
          hover:shadow-md hover:brightness-105
          ${isDragging ? 'opacity-50 shadow-lg z-50' : 'z-10'}
          ${isOverlapping ? 'ring-2 ring-red-500 ring-offset-1' : ''}
        `}
        style={{
          left,
          width,
          top,
          height: ROW_HEIGHT - 8,
          backgroundColor: card.color,
        }}
      >
        {titleFitsInside && (
          <span className="text-xs font-semibold text-white whitespace-nowrap">
            {card.title}
          </span>
        )}
        {assigneeCount > 0 && (
          <div className="flex items-center shrink-0">
            {card.assignees.map((name) => {
              const { icon: Icon, fill, stroke } = ASSIGNEE_CONFIG[name];
              return <Icon key={name} className="w-3.5 h-3.5 drop-shadow-sm" fill={fill} stroke={stroke} />;
            })}
          </div>
        )}
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

      {/* Title floats beside the bar when it can't fit inside — always fully visible.
          z-[15] keeps it above neighbouring bars (z-10) but below the today line (z-20). */}
      {!titleFitsInside && !isDragging && (
        <div
          className="absolute z-[15] flex items-center pointer-events-none"
          style={{ left: left + width + 6, top, height: ROW_HEIGHT - 8 }}
        >
          <span
            className="text-xs font-semibold whitespace-nowrap px-1.5 py-0.5 rounded-md bg-white/90 shadow-sm ring-1 ring-black/5"
            style={{ color: card.color }}
          >
            {card.title}
          </span>
        </div>
      )}
    </>
  );
}
