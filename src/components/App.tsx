import { useState, useCallback } from 'react';
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
import ProjectCardPanel from './sidebar/ProjectCardPanel';
import Timeline from './timeline/Timeline';
import DragOverlay from './shared/DragOverlay';

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const addToTimeline = useProjectStore((s) => s.addToTimeline);
  const moveTimelineItem = useProjectStore((s) => s.moveTimelineItem);
  const removeFromTimeline = useProjectStore((s) => s.removeFromTimeline);

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
        const { date, row } = overData;

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
    [addToTimeline, moveTimelineItem, removeFromTimeline]
  );

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
