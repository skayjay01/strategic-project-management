import { useDroppable } from '@dnd-kit/core';
import { useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import {
  generateColumns,
  COLUMN_WIDTHS,
  ROW_HEIGHT,
  isToday,
} from '../../lib/timelineUtils';
import { format } from 'date-fns';

interface Props {
  rowIndex: number;
}

function DroppableCell({ dateStr, rowIndex, colWidth, today }: {
  dateStr: string;
  rowIndex: number;
  colWidth: number;
  today: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${dateStr}-${rowIndex}`,
    data: {
      type: 'cell',
      date: dateStr,
      row: rowIndex,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        shrink-0 border-r border-b border-slate-100
        ${today ? 'bg-blue-50/30' : ''}
        ${isOver ? 'bg-blue-100/50' : ''}
      `}
      style={{ width: colWidth, height: ROW_HEIGHT }}
    />
  );
}

export default function TimelineRow({ rowIndex }: Props) {
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
    <div className="flex">
      {columns.map((date, i) => (
        <DroppableCell
          key={i}
          dateStr={format(date, 'yyyy-MM-dd')}
          rowIndex={rowIndex}
          colWidth={colWidth}
          today={isToday(date)}
        />
      ))}
    </div>
  );
}
