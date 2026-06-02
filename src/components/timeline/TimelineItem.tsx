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
import { getStatus, elapsedFraction, daysUntil, STATUS_META } from '../../lib/status';
import { VARIANT } from '../../variant';

const ASSIGNEE_CONFIG: Record<Assignee, { icon: typeof Zap; fill: string; stroke: string }> = {
  Yishan: { icon: Zap, fill: '#1a1a1a', stroke: '#1a1a1a' },
  Jack: { icon: Flame, fill: '#f97316', stroke: '#f97316' },
};

// Fonts must match the rendered classes so the fit measurement is accurate.
const TITLE_FONT = '600 12px "Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif'; // text-xs font-semibold (font-ui)
const DURATION_FONT = '400 10px "Space Mono", ui-monospace, monospace'; // text-[10px] (font-mono-num)

// Pick legible text color for a chip based on its background luminance, so
// titles stay readable on both dark (blue/violet) and light (amber/lime) bars.
function chipInk(hex: string): { text: string; faint: string } {
  const h = hex.replace('#', '');
  if (h.length < 6) return { text: 'rgba(255,253,247,0.96)', faint: 'rgba(255,253,247,0.72)' };
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6
    ? { text: 'rgba(26,22,15,0.92)', faint: 'rgba(26,22,15,0.62)' }       // dark ink on light bar
    : { text: 'rgba(255,253,247,0.97)', faint: 'rgba(255,253,247,0.74)' }; // light ink on dark bar
}

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
  const status = getStatus(item.startDate, item.endDate);
  const sm = STATUS_META[status];

  // Right-edge meta label — varies by variant/status (Progress shows time-to-go).
  let metaLabel = `${currentDuration}d`;
  if (VARIANT === 'progress') {
    if (status === 'active') metaLabel = `${Math.max(0, daysUntil(item.endDate))}d left`;
    else if (status === 'upcoming') metaLabel = `in ${Math.max(0, daysUntil(item.startDate))}d`;
    else metaLabel = 'done';
  }

  // Decide whether the title fits inside the bar. If not, it floats just to the
  // right of the bar so the full title is always visible, never truncated.
  // Measure against the ACTUAL meta label so the fit stays correct per variant.
  const assigneeCount = card.assignees?.length ?? 0;
  const titleWidth = measureTextWidth(card.title, TITLE_FONT);
  const durationWidth = measureTextWidth(metaLabel, DURATION_FONT);
  const iconsWidth = assigneeCount * 14; // w-3.5 icons
  const gapWidth = (assigneeCount > 0 ? 2 : 1) * 4; // gap-1 between bar children
  const capWidth = VARIANT === 'board' ? 6 : 0; // status cap eats a little left room
  const reserved = 16 /* px-2 padding */ + iconsWidth + durationWidth + gapWidth + capWidth + 6 /* safety */;
  const titleFitsInside = titleWidth <= width - reserved;

  const ink = chipInk(card.color);
  const frac = elapsedFraction(item.startDate, item.endDate);

  // Status emphasis per variant (opacity/filter + a status ring layered into boxShadow).
  let chipOpacity = 1;
  let chipFilter = 'none';
  if (VARIANT === 'spotlight') {
    if (status === 'done') { chipOpacity = 0.42; chipFilter = 'grayscale(0.55)'; }
    else if (status === 'upcoming') chipOpacity = 0.86;
  } else if (VARIANT === 'progress') {
    if (status === 'done') { chipOpacity = 0.5; chipFilter = 'grayscale(0.45)'; }
    else if (status === 'upcoming') chipOpacity = 0.62;
  }
  const baseShadow = isDragging
    ? '0 12px 26px -6px rgba(33,29,22,0.45), inset 0 1px 0 rgba(255,255,255,0.3)'
    : '0 1px 2px rgba(33,29,22,0.22), inset 0 1px 0 rgba(255,255,255,0.28)';
  const rings: string[] = [];
  if (isOverlapping) rings.push('0 0 0 2px #c2562f');
  if (VARIANT === 'spotlight' && status === 'active') { rings.push('0 0 0 2px #16a34a'); rings.push('0 0 16px rgba(22,163,74,0.5)'); }
  if (VARIANT === 'board') rings.push(`0 0 0 2px ${sm.color}`);
  const boxShadow = [baseShadow, ...rings].join(', ');

  return (
    <>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        data-draggable
        onDoubleClick={() => setEditingCardId(item.projectId)}
        title={`${card.title} · ${sm.label} (${currentDuration}d)\n${item.startDate} — ${item.endDate}`}
        className={`
          group/item absolute rounded-[7px] px-2 py-1 cursor-grab active:cursor-grabbing
          flex items-center gap-1 overflow-hidden select-none
          transition-[filter,transform,opacity] duration-150
          hover:brightness-[1.06]
          ${isDragging ? 'z-50 rotate-[-0.5deg]' : 'z-10'}
        `}
        style={{
          left,
          width,
          top,
          height: ROW_HEIGHT - 8,
          backgroundColor: card.color,
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.13) 100%)',
          boxShadow,
          opacity: isDragging ? 0.6 : chipOpacity,
          filter: chipFilter,
        }}
      >
        {/* Progress: fade the not-yet-elapsed remainder so the filled part reads as progress */}
        {VARIANT === 'progress' && status === 'active' && (
          <div
            className="absolute top-0 bottom-0 right-0 z-0 pointer-events-none"
            style={{ left: `${Math.round(frac * 100)}%`, backgroundColor: 'rgba(250,247,239,0.5)', borderLeft: '1.5px solid rgba(255,255,255,0.75)' }}
          />
        )}
        {/* Board: status-coloured cap */}
        {VARIANT === 'board' && (
          <div className="absolute left-0 top-0 bottom-0 w-1 z-0" style={{ backgroundColor: sm.color }} />
        )}

        {titleFitsInside && (
          <span className="relative z-[1] font-ui text-xs font-semibold whitespace-nowrap" style={{ color: ink.text }}>
            {card.title}
          </span>
        )}
        {assigneeCount > 0 && (
          <div className="relative z-[1] flex items-center shrink-0">
            {card.assignees.map((name) => {
              const { icon: Icon } = ASSIGNEE_CONFIG[name];
              return <Icon key={name} className="w-3.5 h-3.5" fill={ink.text} stroke={ink.text} />;
            })}
          </div>
        )}
        <span className="relative z-[1] font-mono-num text-[10px] shrink-0" style={{ color: ink.faint }}>
          {metaLabel}
        </span>
        {/* Resize handle */}
        <div
          onPointerDown={handleResizeStart}
          className="absolute right-0 top-1 bottom-1 w-1.5 rounded-full cursor-ew-resize opacity-0 group-hover/item:opacity-100 transition-opacity z-[3]"
          style={{ backgroundColor: ink.faint }}
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
            className="font-ui text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--paper-raised)] text-[var(--ink)] ring-1 ring-[var(--line-strong)] shadow-[0_3px_10px_-3px_rgba(33,29,22,0.32)]"
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: card.color }} />
            {card.title}
          </span>
        </div>
      )}
    </>
  );
}
