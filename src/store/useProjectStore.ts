import { create } from 'zustand';
import type { ProjectCard, TimelineItem, ViewMode, Assignee } from '../types';
import { computeEndDate } from '../lib/timelineUtils';
import { supabase } from '../lib/supabase';
import { format, addDays } from 'date-fns';

interface ProjectStore {
  cards: ProjectCard[];
  timelineItems: TimelineItem[];
  viewMode: ViewMode;
  timelineStartDate: string;
  loaded: boolean;
  editingCardId: string | null;
  assigneeFilter: Assignee | null;

  setAssigneeFilter: (filter: Assignee | null) => void;
  setEditingCardId: (id: string | null) => void;
  loadFromSupabase: () => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  setTimelineStartDate: (date: string) => void;
  navigateTimeline: (direction: 'left' | 'right') => void;
  goToToday: () => void;
  addToTimeline: (projectId: string, startDate: string, row: number) => void;
  moveTimelineItem: (itemId: string, newStartDate: string, newRow: number) => void;
  removeFromTimeline: (itemId: string) => void;
  isOnTimeline: (projectId: string) => boolean;
  getCardById: (projectId: string) => ProjectCard | undefined;
  addCard: (card: Omit<ProjectCard, 'id'>) => void;
  updateCard: (id: string, updates: Partial<Omit<ProjectCard, 'id'>>) => void;
  deleteCard: (id: string) => void;
}

const getDefaultStartDate = () => {
  const today = new Date();
  const start = addDays(today, -120);
  return format(start, 'yyyy-MM-dd');
};

export const useProjectStore = create<ProjectStore>()((set, get) => ({
  cards: [],
  timelineItems: [],
  viewMode: 'month' as ViewMode,
  timelineStartDate: getDefaultStartDate(),
  loaded: false,
  editingCardId: null,
  assigneeFilter: null,

  setAssigneeFilter: (filter) => set({ assigneeFilter: filter }),
  setEditingCardId: (id) => set({ editingCardId: id }),

  loadFromSupabase: async () => {
    const [cardsRes, itemsRes] = await Promise.all([
      supabase.from('project_cards').select('*').order('id'),
      supabase.from('timeline_items').select('*'),
    ]);
    set({
      cards: (cardsRes.data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        duration: r.duration,
        color: r.color,
        description: r.description,
        assignees: r.assignees ?? [],
      })),
      timelineItems: (itemsRes.data ?? []).map((r) => ({
        id: r.id,
        projectId: r.project_id,
        startDate: r.start_date,
        endDate: r.end_date,
        row: r.row,
      })),
      loaded: true,
    });
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setTimelineStartDate: (date) => set({ timelineStartDate: date }),

  navigateTimeline: (direction) => {
    const { viewMode, timelineStartDate } = get();
    const current = new Date(timelineStartDate + 'T00:00:00');
    const shift = direction === 'right' ? 1 : -1;
    let newDate: Date;
    switch (viewMode) {
      case 'week':
        newDate = addDays(current, shift * 28);
        break;
      case 'month':
        newDate = addDays(current, shift * 90);
        break;
    }
    set({ timelineStartDate: format(newDate, 'yyyy-MM-dd') });
  },

  goToToday: () => {
    set({ timelineStartDate: getDefaultStartDate() });
  },

  addToTimeline: async (projectId, startDate, row) => {
    const { cards, timelineItems } = get();
    if (timelineItems.some((item) => item.projectId === projectId)) return;
    const card = cards.find((c) => c.id === projectId);
    if (!card) return;
    const endDate = computeEndDate(startDate, card.duration);
    const id = `tl-${projectId}-${Date.now()}`;
    const newItem: TimelineItem = { id, projectId, startDate, endDate, row };
    set({ timelineItems: [...timelineItems, newItem] });
    await supabase.from('timeline_items').insert({
      id,
      project_id: projectId,
      start_date: startDate,
      end_date: endDate,
      row,
    });
  },

  moveTimelineItem: async (itemId, newStartDate, newRow) => {
    const { timelineItems, cards } = get();
    const item = timelineItems.find((i) => i.id === itemId);
    if (!item) return;
    const card = cards.find((c) => c.id === item.projectId);
    if (!card) return;
    const newEndDate = computeEndDate(newStartDate, card.duration);
    set({
      timelineItems: timelineItems.map((i) =>
        i.id !== itemId ? i : { ...i, startDate: newStartDate, endDate: newEndDate, row: newRow }
      ),
    });
    await supabase.from('timeline_items').update({
      start_date: newStartDate,
      end_date: newEndDate,
      row: newRow,
    }).eq('id', itemId);
  },

  removeFromTimeline: async (itemId) => {
    set({ timelineItems: get().timelineItems.filter((i) => i.id !== itemId) });
    await supabase.from('timeline_items').delete().eq('id', itemId);
  },

  isOnTimeline: (projectId) => {
    return get().timelineItems.some((item) => item.projectId === projectId);
  },

  getCardById: (projectId) => {
    return get().cards.find((c) => c.id === projectId);
  },

  addCard: async (card) => {
    const id = `proj-${Date.now()}`;
    const newCard: ProjectCard = { ...card, id };
    set({ cards: [...get().cards, newCard] });
    await supabase.from('project_cards').insert({
      id,
      title: card.title,
      duration: card.duration,
      color: card.color,
      description: card.description,
      assignees: card.assignees,
    });
  },

  updateCard: async (id, updates) => {
    const { cards, timelineItems } = get();
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    const updatedCards = cards.map((c) => (c.id === id ? { ...c, ...updates } : c));

    if (updates.duration !== undefined && updates.duration !== card.duration) {
      const updatedItems = timelineItems.map((item) => {
        if (item.projectId !== id) return item;
        return { ...item, endDate: computeEndDate(item.startDate, updates.duration!) };
      });
      set({ cards: updatedCards, timelineItems: updatedItems });
      // Update timeline items in DB
      for (const item of updatedItems.filter((i) => i.projectId === id)) {
        await supabase.from('timeline_items').update({ end_date: item.endDate }).eq('id', item.id);
      }
    } else {
      set({ cards: updatedCards });
    }

    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.assignees !== undefined) dbUpdates.assignees = updates.assignees;
    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from('project_cards').update(dbUpdates).eq('id', id);
    }
  },

  deleteCard: async (id) => {
    const { cards, timelineItems } = get();
    set({
      cards: cards.filter((c) => c.id !== id),
      timelineItems: timelineItems.filter((i) => i.projectId !== id),
    });
    await supabase.from('project_cards').delete().eq('id', id);
  },
}));
