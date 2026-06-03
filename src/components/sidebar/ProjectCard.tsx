import { useDraggable } from '@dnd-kit/core';
import type { ProjectCard as ProjectCardType } from '../../types';
import { useProjectStore } from '../../store/useProjectStore';
import { Pencil, Trash2, Zap, Flame } from 'lucide-react';
import type { Assignee } from '../../types';
import { STATUS_META, type ProjectStatus } from '../../lib/status';

const ASSIGNEE_CONFIG: Record<Assignee, { icon: typeof Zap; fill: string; stroke: string }> = {
  Yishan: { icon: Zap, fill: '#1a1a1a', stroke: '#1a1a1a' },
  Jack: { icon: Flame, fill: '#f97316', stroke: '#f97316' },
};

interface Props {
  card: ProjectCardType;
  onEdit: (card: ProjectCardType) => void;
  status?: ProjectStatus;
  elapsed?: number;   // 0..1, for the Progress variant's mini bar
  timeLabel?: string; // e.g. "12d left" / "in 4d" / "done"
}

export default function ProjectCard({ card, onEdit, status, elapsed = 0, timeLabel }: Props) {
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

  const sm = status ? STATUS_META[status] : null;
  const dim = status === 'done';                                   // de-emphasise completed
  const pct = status === 'done' ? 100 : status === 'upcoming' ? 0 : Math.round(elapsed * 100);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        group relative rounded-xl bg-[var(--paper-raised)] border mb-2.5 p-3.5
        transition-all duration-200 select-none border-[var(--line-strong)]
        ${isOnTimeline
          ? 'cursor-default'
          : 'cursor-grab active:cursor-grabbing shadow-[0_1px_2px_rgba(33,29,22,0.06)] hover:shadow-[0_8px_22px_-8px_rgba(33,29,22,0.28)] hover:-translate-y-0.5 hover:border-[var(--ink-faint)]'}
        ${dim ? 'opacity-50 grayscale-[0.3]' : ''}
        ${isDragging ? 'opacity-60 shadow-xl rotate-[-0.5deg]' : ''}
      `}
    >
      {/* color spine */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
        style={{ backgroundColor: card.color }}
      />
      <div className="pl-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[15px] leading-[1.2] font-medium text-[var(--ink)] break-words min-w-0">
            {card.title}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0 -mr-1">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onEdit(card); }}
              className="hidden group-hover:flex p-1.5 rounded-lg text-[var(--ink-faint)] hover:bg-[var(--paper-sunk)] hover:text-[var(--ink)] transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}
              className="hidden group-hover:flex p-1.5 rounded-lg text-[var(--ink-faint)] hover:bg-[var(--clay-soft)] hover:text-[var(--clay-deep)] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mt-2">
          {sm && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: sm.soft }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sm.color }} />
              <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: sm.color }}>{sm.label}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 font-mono-num text-[11px] text-[var(--ink-2)]">
            <span className="w-2 h-2 rounded-[3px]" style={{ backgroundColor: card.color }} />
            {timeLabel ? timeLabel : `${card.duration}d`}
          </span>
          {card.assignees?.map((name) => {
            const { icon: Icon, fill, stroke } = ASSIGNEE_CONFIG[name];
            return (
              <span key={name} className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--ink-soft)] uppercase tracking-wide">
                <Icon className="w-3 h-3" fill={fill} stroke={stroke} />
                {name}
              </span>
            );
          })}
        </div>

        {sm && (
          <div className="mt-2 h-1 rounded-full bg-[var(--paper-sunk)] overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: sm.color }} />
          </div>
        )}

        {card.description && (
          <p className="text-xs text-[var(--ink-soft)] mt-1.5 line-clamp-2 leading-relaxed">
            {card.description}
          </p>
        )}
      </div>
    </div>
  );
}
