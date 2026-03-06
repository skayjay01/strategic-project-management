import { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { ProjectCard as ProjectCardType } from '../../types';
import { useProjectStore } from '../../store/useProjectStore';
import ProjectCard from './ProjectCard';
import CardEditorModal from './CardEditorModal';
import { LayoutGrid, Plus } from 'lucide-react';

export default function ProjectCardPanel() {
  const cards = useProjectStore((s) => s.cards);
  const addCard = useProjectStore((s) => s.addCard);
  const updateCard = useProjectStore((s) => s.updateCard);
  const editingCardId = useProjectStore((s) => s.editingCardId);
  const setEditingCardId = useProjectStore((s) => s.setEditingCardId);
  const [editingCard, setEditingCard] = useState<ProjectCardType | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Open modal when editingCardId is set from timeline double-click
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
        w-72 shrink-0 h-full bg-slate-50 border-r border-slate-200
        flex flex-col overflow-hidden transition-colors
        ${isOver ? 'bg-red-50 border-red-200' : ''}
      `}
    >
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-slate-600" />
            <h2 className="text-base font-bold text-slate-800">Projects</h2>
          </div>
          <button
            onClick={handleAdd}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Drag cards to the timeline
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {cards.map((card) => (
          <ProjectCard key={card.id} card={card} onEdit={handleEdit} />
        ))}
      </div>
      {isOver && (
        <div className="p-3 text-center text-xs text-red-500 font-medium bg-red-50 border-t border-red-200">
          Drop here to remove from timeline
        </div>
      )}
      {showModal && (
        <CardEditorModal
          card={editingCard}
          defaultColorIndex={cards.length}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
