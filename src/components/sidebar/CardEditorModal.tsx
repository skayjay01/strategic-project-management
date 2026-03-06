import { useState, useEffect } from 'react';
import type { ProjectCard } from '../../types';
import { X } from 'lucide-react';

const PRESET_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#ef4444',
  '#f59e0b', '#ec4899', '#06b6d4', '#84cc16',
];

interface Props {
  card: ProjectCard | null; // null = creating new
  defaultColorIndex?: number;
  onSave: (data: Omit<ProjectCard, 'id'>) => void;
  onClose: () => void;
}

export default function CardEditorModal({ card, defaultColorIndex = 0, onSave, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [color, setColor] = useState(PRESET_COLORS[defaultColorIndex % PRESET_COLORS.length]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDuration(card.duration);
      setColor(card.color);
      setDescription(card.description);
    }
  }, [card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), duration, color, description: description.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-96 max-w-[90vw]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-800">
            {card ? 'Edit Project' : 'New Project'}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Project name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Duration (days)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Color</label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Brief description..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {card ? 'Save Changes' : 'Create Project'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
