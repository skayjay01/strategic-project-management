import { useState, useCallback, useEffect, useRef } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragMoveEvent,
  type CollisionDetection,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
} from '@dnd-kit/core';
import { useProjectStore } from '../store/useProjectStore';
import { dateFromGridPixel, ROW_HEIGHT } from '../lib/timelineUtils';
import ProjectCardPanel from './sidebar/ProjectCardPanel';
import Timeline from './timeline/Timeline';
import DragOverlay from './shared/DragOverlay';

const collisionDetection: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  if (pointer.length > 0) return pointer;
  return closestCenter(args);
};

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const pointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
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

  // Track the real pointer position at all times during drag
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      pointerPos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointermove', handler);
    return () => window.removeEventListener('pointermove', handler);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Capture initial pointer position from activator event
    const e = event.activatorEvent as PointerEvent;
    pointerPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    // Update pointer position from activator + delta
    const e = event.activatorEvent as PointerEvent;
    pointerPos.current = {
      x: e.clientX + event.delta.x,
      y: e.clientY + event.delta.y,
    };
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

      if (overData?.type === 'cell') {
        const gridEl = document.querySelector('[data-timeline-grid]');
        if (!gridEl) return;

        const gridRect = gridEl.getBoundingClientRect();
        const xInGrid = pointerPos.current.x - gridRect.left;
        const yInGrid = pointerPos.current.y - gridRect.top;

        const startDate = new Date(timelineStartDate + 'T00:00:00');
        const date = dateFromGridPixel(xInGrid, startDate, viewMode);
        const row = Math.max(0, Math.floor(yInGrid / ROW_HEIGHT));

        if (active.data.current?.type === 'card') {
          addToTimeline(active.data.current.projectId, date, row);
          return;
        }

        if (active.data.current?.type === 'timeline-item') {
          moveTimelineItem(active.data.current.itemId, date, row);
          return;
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
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
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
