import { DragOverlay as DndDragOverlay } from '@dnd-kit/core';
import { useProjectStore } from '../../store/useProjectStore';

interface Props {
  activeId: string | null;
}

export default function DragOverlay({ activeId }: Props) {
  const cards = useProjectStore((s) => s.cards);
  const timelineItems = useProjectStore((s) => s.timelineItems);

  if (!activeId) return <DndDragOverlay />;

  // Dragging a sidebar card
  if (activeId.startsWith('card-')) {
    const projectId = activeId.replace('card-', '');
    const card = cards.find((c) => c.id === projectId);
    if (!card) return <DndDragOverlay />;

    return (
      <DndDragOverlay>
        <div
          className="rounded-lg bg-white border-2 shadow-xl p-3 w-60 opacity-90"
          style={{ borderColor: card.color }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: card.color }}
            />
            <span className="text-sm font-semibold text-slate-800">
              {card.title}
            </span>
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded-full text-white ml-auto"
              style={{ backgroundColor: card.color }}
            >
              {card.duration}d
            </span>
          </div>
        </div>
      </DndDragOverlay>
    );
  }

  // Dragging a timeline item
  if (activeId.startsWith('timeline-')) {
    const itemId = activeId.replace('timeline-', '');
    const item = timelineItems.find((i) => i.id === itemId);
    if (!item) return <DndDragOverlay />;
    const card = cards.find((c) => c.id === item.projectId);
    if (!card) return <DndDragOverlay />;

    return (
      <DndDragOverlay>
        <div
          className="rounded-md px-3 py-1.5 shadow-xl opacity-90 flex items-center gap-2"
          style={{ backgroundColor: card.color, minWidth: 120 }}
        >
          <span className="text-xs font-semibold text-white">
            {card.title}
          </span>
          <span className="text-[10px] text-white/70">
            {card.duration}d
          </span>
        </div>
      </DndDragOverlay>
    );
  }

  return <DndDragOverlay />;
}
