import { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useProjectRows, type ProjectRow, type RowStatus } from '../../lib/useProjectRows';
import CardEditorModal from '../sidebar/CardEditorModal';
import AssigneeFilter from '../shared/AssigneeFilter';
import { Plus, Zap, Flame, Columns3 } from 'lucide-react';
import type { Assignee, ProjectCard as ProjectCardType } from '../../types';

const ASSIGNEE_ICON: Record<Assignee, typeof Zap> = { Yishan: Zap, Jack: Flame };

const COLUMNS: { key: RowStatus; label: string; color: string }[] = [
  { key: 'active',      label: 'Now',         color: '#16a34a' },
  { key: 'upcoming',    label: 'Upcoming',    color: '#c2562f' },
  { key: 'done',        label: 'Done',        color: '#8c8270' },
  { key: 'unscheduled', label: 'Unscheduled', color: '#a89d87' },
];

export default function KanbanBoard() {
  const { counts, byStatus } = useProjectRows();
  const addCard = useProjectStore((s) => s.addCard);
  const updateCard = useProjectStore((s) => s.updateCard);
  const cardsLen = useProjectStore((s) => s.cards.length);
  const timelineItems = useProjectStore((s) => s.timelineItems);

  const [editing, setEditing] = useState<ProjectCardType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const openNew = () => { setEditing(null); setShowModal(true); };
  const openEdit = (card: ProjectCardType) => { setEditing(card); setShowModal(true); };
  const editingItem = editing ? timelineItems.find((i) => i.projectId === editing.id) ?? null : null;

  const Card = ({ row, color }: { row: ProjectRow; color: string }) => {
    const { card, status, elapsed, daysLeft, dateLabel } = row;
    return (
      <button
        onClick={() => openEdit(card)}
        className={`group text-left w-full rounded-xl bg-[var(--paper-raised)] border border-[var(--line-strong)] p-3 mb-2.5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-10px_rgba(33,29,22,0.32)] ${status === 'done' ? 'opacity-60' : ''}`}
        style={{ boxShadow: '0 1px 2px rgba(33,29,22,0.06)' }}
      >
        <div className="flex items-start gap-2">
          <span className="mt-1 w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: card.color }} />
          <h3 className="font-display text-[15px] font-medium leading-snug text-[var(--ink)] break-words min-w-0">{card.title}</h3>
        </div>
        <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mt-2 pl-[18px]">
          <span className="font-mono-num text-[11px] text-[var(--ink-soft)]">{row.scheduled ? dateLabel : `${card.duration}d`}</span>
          {card.assignees?.map((a) => { const I = ASSIGNEE_ICON[a]; return <span key={a} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-[var(--ink-soft)]"><I className="w-3 h-3" fill="#6b6457" stroke="#6b6457" />{a}</span>; })}
        </div>
        {status === 'active' && (
          <div className="mt-2.5 pl-[18px]">
            <div className="h-1.5 rounded-full bg-[var(--paper-sunk)] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.round(elapsed * 100)}%`, background: color }} />
            </div>
            <div className="mt-1 font-mono-num text-[10px] font-bold" style={{ color }}>{daysLeft}d left</div>
          </div>
        )}
        {status === 'upcoming' && (
          <div className="mt-1.5 pl-[18px] font-mono-num text-[10px] font-bold" style={{ color }}>in {daysLeft}d</div>
        )}
      </button>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--paper)]">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-[var(--line-strong)] bg-[var(--paper-raised)]">
        <Columns3 className="w-5 h-5 text-[var(--clay)]" />
        <div>
          <div className="eyebrow text-[var(--clay)]">Status Board</div>
          <h1 className="font-display text-xl font-semibold text-[var(--ink)] leading-none mt-0.5">Kanban</h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <AssigneeFilter />
          <button onClick={openNew} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-[var(--paper-raised)] bg-[var(--ink)] hover:bg-[var(--clay)] transition-colors">
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-4 px-6 py-5 overflow-x-auto">
        {COLUMNS.map((col) => (
          <div key={col.key} className="flex-1 min-w-[240px] flex flex-col rounded-2xl bg-[var(--paper-panel)] border border-[var(--line)] overflow-hidden">
            <div className="px-3.5 py-3" style={{ borderTop: `3px solid ${col.color}` }}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                <span className="text-sm font-bold tracking-wide" style={{ color: col.key === 'done' || col.key === 'unscheduled' ? 'var(--ink-2)' : col.color }}>{col.label}</span>
                <span className="ml-auto font-mono-num text-sm font-bold px-2 py-0.5 rounded-full" style={{ color: col.color, background: `${col.color}1f` }}>{counts[col.key]}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto panel-scroll px-3 pb-3 pt-1">
              {byStatus[col.key].length === 0 ? (
                <div className="text-xs italic text-[var(--ink-faint)] px-1 py-3">Empty</div>
              ) : (
                byStatus[col.key].map((row) => <Card key={row.card.id} row={row} color={col.color} />)
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <CardEditorModal
          card={editing}
          timelineItem={editingItem}
          defaultColorIndex={cardsLen}
          onSave={(data) => { editing ? updateCard(editing.id, data) : addCard(data); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
