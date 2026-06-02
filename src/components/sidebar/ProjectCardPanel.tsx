import { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { ProjectCard as ProjectCardType } from '../../types';
import { useProjectStore } from '../../store/useProjectStore';
import ProjectCard from './ProjectCard';
import CardEditorModal from './CardEditorModal';
import { LayoutGrid, Plus } from 'lucide-react';

export default function ProjectCardPanel() {
  const allCards = useProjectStore((s) => s.cards);
  const assigneeFilter = useProjectStore((s) => s.assigneeFilter);
  const cards = assigneeFilter
    ? allCards.filter((c) => c.assignees?.includes(assigneeFilter))
    : allCards;
  const timelineItems = useProjectStore((s) => s.timelineItems);
  const addCard = useProjectStore((s) => s.addCard);
  const updateCard = useProjectStore((s) => s.updateCard);
  const editingCardId = useProjectStore((s) => s.editingCardId);
  const setEditingCardId = useProjectStore((s) => s.setEditingCardId);
  const [editingCard, setEditingCard] = useState<ProjectCardType | null>(null);
  const [showModal, setShowModal] = useState(false);

  const editingTimelineItem = editingCard
    ? timelineItems.find((i) => i.projectId === editingCard.id) ?? null
    : null;

  useEffect(() => {
    if (editingCardId) {
      const card = cards.find((c) => c.id === editingCardId);
      if (card) {
        setEditingCard(card);
        setShowModal(true);
      }
      setEditingCardId(null);
    }
  }, [editingCardId, cards, setEditingCardId]);

  const { setNodeRef, isOver } = useDroppable({
    id: 'sidebar',
    data: { type: 'sidebar' },
  });

  const handleEdit = (card: ProjectCardType) => {
    setEditingCard(card);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCard(null);
    setShowModal(true);
  };

  const handleSave = (data: Omit<ProjectCardType, 'id'>) => {
    if (editingCard) {
      updateCard(editingCard.id, data);
    } else {
      addCard(data);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        w-72 shrink-0 h-full border-r flex flex-col overflow-hidden transition-colors duration-200
        ${isOver ? 'bg-[var(--clay-soft)] border-[var(--clay)]' : 'bg-[var(--paper-panel)] border-[var(--line-strong)]'}
      `}
    >
      <div className="px-5 pt-5 pb-4 border-b border-[var(--line)] reveal-up">
        <div className="eyebrow text-[var(--clay)] flex items-center gap-1.5">
          <LayoutGrid className="w-3 h-3" />
          Strategic Timeline
        </div>
        <div className="flex items-end justify-between mt-2">
          <h2 className="font-display text-[28px] leading-none font-semibold text-[var(--ink)]">
            Projects
          </h2>
          <button
            onClick={handleAdd}
            aria-label="New project"
            className="group flex items-center justify-center w-8 h-8 rounded-full bg-[var(--ink)] text-[var(--paper-raised)] hover:bg-[var(--clay)] transition-colors duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--ink-soft)] flex items-center gap-2">
          <span className="font-mono-num text-[var(--ink-2)]">{cards.length}</span>
          <span className="w-1 h-1 rounded-full bg-[var(--ink-faint)]" />
          drag onto the timeline
        </p>
      </div>
      <div className="flex-1 overflow-y-auto panel-scroll px-3 py-3 stagger">
        {cards.map((card) => (
          <ProjectCard key={card.id} card={card} onEdit={handleEdit} />
        ))}
      </div>
      {isOver && (
        <div className="px-3 py-3 text-center eyebrow text-[var(--clay-deep)] bg-[var(--clay-soft)] border-t border-[var(--clay)]">
          Release to remove from timeline
        </div>
      )}
      {showModal && (
        <CardEditorModal
          card={editingCard}
          timelineItem={editingTimelineItem}
          defaultColorIndex={cards.length}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
