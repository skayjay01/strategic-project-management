import { useState } from 'react';
import { format } from 'date-fns';
import { useProjectStore } from '../../store/useProjectStore';
import { useProjectRows } from '../../lib/useProjectRows';
import CardEditorModal from '../sidebar/CardEditorModal';
import AssigneeFilter from '../shared/AssigneeFilter';
import { Plus, Zap, Flame, Radio } from 'lucide-react';
import type { Assignee, ProjectCard as ProjectCardType } from '../../types';

const ASSIGNEE_ICON: Record<Assignee, typeof Zap> = { Yishan: Zap, Jack: Flame };
const SC = { active: '#3ddc84', upcoming: '#eb8a5a', done: '#9c917d' };

export default function CommandCenter() {
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

  const today = format(new Date(), 'EEEE, MMMM d');

  const stat = (n: number, label: string, color: string) => (
    <div className="flex-1 rounded-2xl px-5 py-4" style={{ background: '#211d16', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="font-display text-4xl font-semibold leading-none" style={{ color }}>{n}</div>
      <div className="mt-1.5 eyebrow" style={{ color: 'rgba(241,236,224,0.5)' }}>{label}</div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col" style={{ background: '#16130e', color: '#f1ece0' }}>
      {/* header */}
      <header className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Radio className="w-5 h-5" style={{ color: SC.active }} />
        <div>
          <div className="eyebrow" style={{ color: SC.active }}>Command Center</div>
          <div className="font-mono-num text-xs" style={{ color: 'rgba(241,236,224,0.55)' }}>{today}</div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <AssigneeFilter dark />
          <button onClick={openNew} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-[#16130e] transition-transform hover:scale-[1.03]" style={{ background: SC.active }}>
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto panel-scroll px-6 py-5">
        {/* stat tiles */}
        <div className="flex gap-4 reveal-up">
          {stat(counts.active, 'Active now', SC.active)}
          {stat(counts.upcoming, 'Upcoming', SC.upcoming)}
          {stat(counts.done, 'Completed', SC.done)}
        </div>

        {/* ACTIVE — the hero */}
        <div className="flex items-center gap-2.5 mt-8 mb-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-70" style={{ background: SC.active, animation: 'today-pulse 2s ease-in-out infinite' }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: SC.active }} />
          </span>
          <h2 className="font-display text-xl font-semibold">Running right now</h2>
          <span className="font-mono-num text-sm" style={{ color: 'rgba(241,236,224,0.45)' }}>{counts.active}</span>
        </div>

        {byStatus.active.length === 0 ? (
          <p className="text-sm italic px-1" style={{ color: 'rgba(241,236,224,0.4)' }}>Nothing is scheduled across today.</p>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {byStatus.active.map(({ card, elapsed, daysLeft, dateLabel }) => (
              <button
                key={card.id}
                onClick={() => openEdit(card)}
                className="text-left rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
                style={{ background: '#211d16', border: `1px solid ${SC.active}55`, boxShadow: `0 0 0 1px ${SC.active}22, 0 10px 30px -12px ${SC.active}66` }}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0" style={{ background: card.color }} />
                  <h3 className="font-display text-lg font-medium leading-tight flex-1">{card.title}</h3>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px]" style={{ color: 'rgba(241,236,224,0.55)' }}>
                  <span className="font-mono-num">{dateLabel}</span>
                  {card.assignees?.map((a) => { const I = ASSIGNEE_ICON[a]; return <span key={a} className="inline-flex items-center gap-1"><I className="w-3 h-3" style={{ color: '#f1ece0' }} />{a}</span>; })}
                </div>
                <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.round(elapsed * 100)}%`, background: SC.active }} />
                </div>
                <div className="flex items-center justify-between mt-1.5 font-mono-num text-[11px]">
                  <span style={{ color: 'rgba(241,236,224,0.45)' }}>{Math.round(elapsed * 100)}%</span>
                  <span style={{ color: SC.active }}>{daysLeft}d left</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* UP NEXT */}
        {byStatus.upcoming.length > 0 && (
          <>
            <h2 className="font-display text-lg font-semibold mt-9 mb-3" style={{ color: 'rgba(241,236,224,0.85)' }}>Up next</h2>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {byStatus.upcoming.map(({ card, daysLeft, dateLabel }) => (
                <button key={card.id} onClick={() => openEdit(card)} className="text-left rounded-xl p-3.5 transition-transform hover:-translate-y-0.5" style={{ background: '#1d1912', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: card.color }} />
                    <h3 className="font-display text-sm font-medium leading-tight flex-1">{card.title}</h3>
                    <span className="font-mono-num text-[11px] px-1.5 py-0.5 rounded" style={{ color: SC.upcoming, background: `${SC.upcoming}22` }}>in {daysLeft}d</span>
                  </div>
                  <div className="font-mono-num text-[11px] mt-1.5 pl-4" style={{ color: 'rgba(241,236,224,0.45)' }}>{dateLabel}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* COMPLETED */}
        {byStatus.done.length > 0 && (
          <>
            <h2 className="font-display text-base font-semibold mt-9 mb-3" style={{ color: 'rgba(241,236,224,0.5)' }}>Completed</h2>
            <div className="flex flex-wrap gap-2">
              {byStatus.done.map(({ card }) => (
                <button key={card.id} onClick={() => openEdit(card)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-opacity hover:opacity-100" style={{ background: '#1d1912', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(241,236,224,0.5)', opacity: 0.7 }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: card.color }} />
                  {card.title}
                </button>
              ))}
            </div>
          </>
        )}

        {byStatus.unscheduled.length > 0 && (
          <p className="mt-9 text-xs font-mono-num" style={{ color: 'rgba(241,236,224,0.35)' }}>
            {byStatus.unscheduled.length} project(s) not yet scheduled — open the Focus Timeline to place them.
          </p>
        )}
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
