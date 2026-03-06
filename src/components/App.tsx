import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type CollisionDetection,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
} from '@dnd-kit/core';

const collisionDetection: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  if (pointer.length > 0) return pointer;
  return closestCenter(args);
};
import { useProjectStore } from '../store/useProjectStore';
import { calcDayFromPointerInCell } from '../lib/timelineUtils';
import ProjectCardPanel from './sidebar/ProjectCardPanel';
import Timeline from './timeline/Timeline';
import DragOverlay from './shared/DragOverlay';

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const addToTimeline = useProjectStore((s) => s.addToTimeline);
  const moveTimelineItem = useProjectStore((s) => s.moveTimelineItem);
  const removeFromTimeline = useProjectStore((s) => s.removeFromTimeline);
  const viewMode = useProjectStore((s) => s.viewMode);
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
        // Dropped outside - if it was a timeline item, remove it
        if (active.data.current?.type === 'timeline-item') {
          removeFromTimeline(active.data.current.itemId);
        }
        return;
      }

      const overData = over.data.current;

      // Dropped on sidebar → remove from timeline
      if (overData?.type === 'sidebar') {
        if (active.data.current?.type === 'timeline-item') {
          removeFromTimeline(active.data.current.itemId);
        }
        return;
      }

      // Dropped on a timeline cell
      if (overData?.type === 'cell') {
        const row = overData.row as number;
        let date = overData.date as string;

        // Calculate day-level precision for month/week views
        if (viewMode !== 'day') {
          const activatorEvent = event.activatorEvent as PointerEvent;
          const pointerX = activatorEvent.clientX + event.delta.x;
          date = calcDayFromPointerInCell(
            pointerX,
            over.rect,
            date,
            viewMode
          );
        }

        // Sidebar card → add to timeline
        if (active.data.current?.type === 'card') {
          addToTimeline(active.data.current.projectId, date, row);
          return;
        }

        // Timeline item → move
        if (active.data.current?.type === 'timeline-item') {
          moveTimelineItem(active.data.current.itemId, date, row);
          return;
        }
      }
    },
    [addToTimeline, moveTimelineItem, removeFromTimeline, viewMode]
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
