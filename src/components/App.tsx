import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { useProjectStore } from '../store/useProjectStore';
import { dateFromGridPixel, ROW_HEIGHT } from '../lib/timelineUtils';
import ProjectCardPanel from './sidebar/ProjectCardPanel';
import Timeline from './timeline/Timeline';
import DragOverlay from './shared/DragOverlay';

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

        // Use activatorEvent + delta for pointer position
        const e = event.activatorEvent as PointerEvent;
        const px = e.clientX + event.delta.x;
        const py = e.clientY + event.delta.y;
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
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading projects...</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex bg-slate-50">
        <ProjectCardPanel />
        <Timeline />
      </div>
      <DragOverlay activeId={activeId} />
    </DndContext>
  );
}
