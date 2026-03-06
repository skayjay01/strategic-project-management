import { useDroppable } from '@dnd-kit/core';
import { useProjectStore } from '../../store/useProjectStore';
import ProjectCard from './ProjectCard';
import { LayoutGrid } from 'lucide-react';

export default function ProjectCardPanel() {
  const cards = useProjectStore((s) => s.cards);

  const { setNodeRef, isOver } = useDroppable({
    id: 'sidebar',
    data: { type: 'sidebar' },
  });

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
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-slate-600" />
          <h2 className="text-base font-bold text-slate-800">Projects</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Drag cards to the timeline
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {cards.map((card) => (
          <ProjectCard key={card.id} card={card} />
        ))}
      </div>
      {isOver && (
        <div className="p-3 text-center text-xs text-red-500 font-medium bg-red-50 border-t border-red-200">
          Drop here to remove from timeline
        </div>
      )}
    </div>
  );
}
