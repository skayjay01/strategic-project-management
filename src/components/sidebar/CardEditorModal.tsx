import { useState, useEffect } from 'react';
import type { ProjectCard, Assignee, TimelineItem } from '../../types';
import { X, Zap, Flame } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const ASSIGNEE_OPTIONS: Assignee[] = ['Jack', 'Yishan'];
const ASSIGNEE_CONFIG: Record<Assignee, { icon: typeof Zap; fill: string; stroke: string }> = {
  Yishan: { icon: Zap, fill: '#1a1a1a', stroke: '#1a1a1a' },
  Jack: { icon: Flame, fill: '#f97316', stroke: '#f97316' },
};

const PRESET_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#ef4444',
  '#f59e0b', '#ec4899', '#06b6d4', '#84cc16',
];

interface Props {
  card: ProjectCard | null; // null = creating new
  timelineItem?: TimelineItem | null;
  defaultColorIndex?: number;
  onSave: (data: Omit<ProjectCard, 'id'>) => void;
  onClose: () => void;
}

export default function CardEditorModal({ card, timelineItem, defaultColorIndex = 0, onSave, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [color, setColor] = useState(PRESET_COLORS[defaultColorIndex % PRESET_COLORS.length]);
  const [description, setDescription] = useState('');
  const [assignees, setAssignees] = useState<Assignee[]>([]);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDuration(card.duration);
      setColor(card.color);
      setDescription(card.description);
      setAssignees(card.assignees ?? []);
    }
  }, [card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), duration, color, description: description.trim(), assignees });
    onClose();
  };

  const inputClass =
    'w-full px-3 py-2 text-sm bg-[var(--paper-sunk)] border border-[var(--line-strong)] rounded-lg text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)] focus:border-transparent transition-shadow';
  const labelClass = 'block eyebrow text-[var(--ink-soft)] mb-1.5';

  return (
    <div className="fixed inset-0 bg-[var(--ink)]/45 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--paper-raised)] rounded-2xl shadow-2xl w-96 max-w-[90vw] ring-1 ring-[var(--line-strong)] reveal-up overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--line)]">
          <div>
            <div className="eyebrow text-[var(--clay)]">{card ? 'Edit' : 'New'}</div>
            <h3 className="font-display text-xl font-semibold text-[var(--ink)] leading-tight mt-0.5">
              {card ? 'Edit Project' : 'New Project'}
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-[var(--paper-sunk)] text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Project name"
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Duration (days)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              className={`${inputClass} font-mono-num`}
            />
          </div>

          {timelineItem && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Start Date</label>
                <div className="px-3 py-2 text-sm font-mono-num text-[var(--ink-2)] bg-[var(--paper-sunk)] border border-[var(--line)] rounded-lg">
                  {format(parseISO(timelineItem.startDate), 'MMM d, yyyy')}
                </div>
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <div className="px-3 py-2 text-sm font-mono-num text-[var(--ink-2)] bg-[var(--paper-sunk)] border border-[var(--line)] rounded-lg">
                  {format(parseISO(timelineItem.endDate), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Color</label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  className={`w-7 h-7 rounded-lg transition-all duration-150 ${
                    color === c
                      ? 'ring-2 ring-offset-2 ring-offset-[var(--paper-raised)] ring-[var(--ink)] scale-110'
                      : 'hover:scale-105 ring-1 ring-black/10'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="Brief description…"
            />
          </div>

          <div>
            <label className={labelClass}>Assigned To</label>
            <div className="flex gap-2">
              {ASSIGNEE_OPTIONS.map((name) => {
                const selected = assignees.includes(name);
                const { icon: Icon, fill, stroke } = ASSIGNEE_CONFIG[name];
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() =>
                      setAssignees((prev) =>
                        selected ? prev.filter((a) => a !== name) : [...prev, name]
                      )
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 ${
                      selected
                        ? 'bg-[var(--ink)] text-[var(--paper-raised)] border-[var(--ink)]'
                        : 'bg-[var(--paper-raised)] text-[var(--ink-2)] border-[var(--line-strong)] hover:border-[var(--ink-faint)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" fill={selected ? '#faf7ef' : fill} stroke={selected ? '#faf7ef' : stroke} />
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-[var(--paper-raised)] bg-[var(--ink)] rounded-lg hover:bg-[var(--clay)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[var(--ink)] transition-colors duration-200"
            >
              {card ? 'Save Changes' : 'Create Project'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-[var(--ink-2)] bg-[var(--paper-sunk)] rounded-lg hover:bg-[var(--line)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
