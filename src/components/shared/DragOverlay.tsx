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
          className="rounded-xl bg-[var(--paper-raised)] ring-1 ring-[var(--line-strong)] shadow-2xl p-3 w-60 rotate-[-1deg]"
          style={{ boxShadow: '0 18px 40px -12px rgba(33,29,22,0.5)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-[3px] shrink-0" style={{ backgroundColor: card.color }} />
            <span className="font-display text-sm font-medium text-[var(--ink)] truncate">
              {card.title}
            </span>
            <span className="font-mono-num text-[11px] text-[var(--ink-soft)] ml-auto shrink-0">
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
          className="rounded-[7px] px-3 py-1.5 flex items-center gap-2 rotate-[-1deg]"
          style={{
            backgroundColor: card.color,
            minWidth: 120,
            backgroundImage:
              'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.14) 100%)',
            boxShadow: '0 16px 34px -8px rgba(33,29,22,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}
        >
          <span className="font-ui text-xs font-semibold text-white drop-shadow-sm">
            {card.title}
          </span>
          <span className="font-mono-num text-[10px] text-white/75">
            {card.duration}d
          </span>
        </div>
      </DndDragOverlay>
    );
  }

  return <DndDragOverlay />;
}
