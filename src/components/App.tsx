import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from '@dnd-kit/core';
import { useProjectStore } from '../store/useProjectStore';
import { dateFromGridPixel, ROW_HEIGHT } from '../lib/timelineUtils';
import ProjectCardPanel from './sidebar/ProjectCardPanel';
import Timeline from './timeline/Timeline';
import DragOverlay from './shared/DragOverlay';
import { VARIANT } from '../variant';
import CommandCenter from './views/CommandCenter';
import KanbanBoard from './views/KanbanBoard';

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const addToTimeline = useProjectStore((s) => s.addToTimeline);
  const moveTimelineItem = useProjectStore((s) => s.moveTimelineItem);
  const removeFromTimeline = useProjectStore((s) => s.removeFromTimeline);
  const viewMode = useProjectStore((s) => s.viewMode);
  const timelineStartDate = useProjectStore((s) => s.timelineStartDate);
  const loaded = useProjectStore((s) => s.loaded);
  const loadFromSupabase = useProjectStore((s) => s.loadFromSupabase);

  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;

      if (!over) {
        if (active.data.current?.type === 'timeline-item') {
          removeFromTimeline(active.data.current.itemId);
        }
        return;
      }

      const overData = over.data.current;

      if (overData?.type === 'sidebar') {
        if (active.data.current?.type === 'timeline-item') {
          removeFromTimeline(active.data.current.itemId);
        }
        return;
      }

      // Dropped on the timeline grid
      if (overData?.type === 'timeline-grid') {
        const gridEl = document.querySelector('[data-timeline-grid]');
        if (!gridEl) return;

        // Use overlay position (element's left edge + delta), not raw pointer
        const initialRect = event.active.rect.current.initial;
        const e = event.activatorEvent as PointerEvent;
        let px: number, py: number;
        if (initialRect) {
          px = initialRect.left + event.delta.x;
          py = initialRect.top + event.delta.y;
        } else {
          px = e.clientX + event.delta.x;
          py = e.clientY + event.delta.y;
        }
        const gridRect = gridEl.getBoundingClientRect();
        const xInGrid = px - gridRect.left;
        const yInGrid = py - gridRect.top;

        const startDate = new Date(timelineStartDate + 'T00:00:00');
        const date = dateFromGridPixel(xInGrid, startDate, viewMode);
        const row = Math.max(0, Math.floor(yInGrid / ROW_HEIGHT));

        if (active.data.current?.type === 'card') {
          addToTimeline(active.data.current.projectId, date, row);
        } else if (active.data.current?.type === 'timeline-item') {
          moveTimelineItem(active.data.current.itemId, date, row);
        }
      }
    },
    [addToTimeline, moveTimelineItem, removeFromTimeline, viewMode, timelineStartDate]
  );

  if (!loaded) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3">
        <div className="eyebrow text-[var(--clay)]">Strategic Timeline</div>
        <p className="font-display text-2xl text-[var(--ink)] reveal-fade">
          Setting the drafting table<span className="animate-pulse">…</span>
        </p>
      </div>
    );
  }

  // Drastically different layouts per variant. Command Center & Kanban are
  // self-contained status views (no drag-to-schedule); Focus Timeline keeps DnD.
  if (VARIANT === 'spotlight') return <CommandCenter />;
  if (VARIANT === 'board') return <KanbanBoard />;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex">
        <ProjectCardPanel />
        <Timeline />
      </div>
      <DragOverlay activeId={activeId} />
    </DndContext>
  );
}
