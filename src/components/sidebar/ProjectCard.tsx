import { useDraggable } from '@dnd-kit/core';
import type { ProjectCard as ProjectCardType } from '../../types';
import { useProjectStore } from '../../store/useProjectStore';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  card: ProjectCardType;
  onEdit: (card: ProjectCardType) => void;
}

export default function ProjectCard({ card, onEdit }: Props) {
  const isOnTimeline = useProjectStore((s) => s.isOnTimeline(card.id));
  const deleteCard = useProjectStore((s) => s.deleteCard);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `card-${card.id}`,
    data: {
      type: 'card',
      projectId: card.id,
    },
    disabled: isOnTimeline,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        group relative rounded-lg bg-white border border-slate-200 p-3 mb-2
        transition-all duration-150 select-none
        ${isOnTimeline ? 'opacity-40 cursor-default' : 'cursor-grab hover:shadow-md hover:border-slate-300 active:cursor-grabbing'}
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
      `}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: card.color }}
      />
      <div className="pl-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800 truncate">
            {card.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onEdit(card); }}
              className="hidden group-hover:flex p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}
              className="hidden group-hover:flex p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: card.color }}
            >
              {card.duration}d
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
          {card.description}
        </p>
      </div>
    </div>
  );
}
