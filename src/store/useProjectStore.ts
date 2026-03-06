import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProjectCard, TimelineItem, ViewMode } from '../types';
import { sampleProjects } from '../data/sampleProjects';
import { computeEndDate } from '../lib/timelineUtils';
import { format, addDays } from 'date-fns';

interface ProjectStore {
  cards: ProjectCard[];
  timelineItems: TimelineItem[];
  viewMode: ViewMode;
  timelineStartDate: string; // ISO date

  setViewMode: (mode: ViewMode) => void;
  setTimelineStartDate: (date: string) => void;
  navigateTimeline: (direction: 'left' | 'right') => void;
  goToToday: () => void;
  addToTimeline: (projectId: string, startDate: string, row: number) => void;
  moveTimelineItem: (itemId: string, newStartDate: string, newRow: number) => void;
  removeFromTimeline: (itemId: string) => void;
  isOnTimeline: (projectId: string) => boolean;
  getCardById: (projectId: string) => ProjectCard | undefined;
}

const getDefaultStartDate = () => {
  const today = new Date();
  const start = addDays(today, -7);
  return format(start, 'yyyy-MM-dd');
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      cards: sampleProjects,
      timelineItems: [],
      viewMode: 'day' as ViewMode,
      timelineStartDate: getDefaultStartDate(),

      setViewMode: (mode) => set({ viewMode: mode }),

      setTimelineStartDate: (date) => set({ timelineStartDate: date }),

      navigateTimeline: (direction) => {
        const { viewMode, timelineStartDate } = get();
        const current = new Date(timelineStartDate + 'T00:00:00');
        const shift = direction === 'right' ? 1 : -1;
        let newDate: Date;
        switch (viewMode) {
          case 'day':
            newDate = addDays(current, shift * 7);
            break;
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

      addToTimeline: (projectId, startDate, row) => {
        const { cards, timelineItems } = get();
        if (timelineItems.some((item) => item.projectId === projectId)) return;
        const card = cards.find((c) => c.id === projectId);
        if (!card) return;
        const endDate = computeEndDate(startDate, card.duration);
        const newItem: TimelineItem = {
          id: `tl-${projectId}-${Date.now()}`,
          projectId,
          startDate,
          endDate,
          row,
        };
        set({ timelineItems: [...timelineItems, newItem] });
      },

      moveTimelineItem: (itemId, newStartDate, newRow) => {
        const { timelineItems, cards } = get();
        set({
          timelineItems: timelineItems.map((item) => {
            if (item.id !== itemId) return item;
            const card = cards.find((c) => c.id === item.projectId);
            if (!card) return item;
            return {
              ...item,
              startDate: newStartDate,
              endDate: computeEndDate(newStartDate, card.duration),
              row: newRow,
            };
          }),
        });
      },

      removeFromTimeline: (itemId) => {
        const { timelineItems } = get();
        set({ timelineItems: timelineItems.filter((item) => item.id !== itemId) });
      },

      isOnTimeline: (projectId) => {
        return get().timelineItems.some((item) => item.projectId === projectId);
      },

      getCardById: (projectId) => {
        return get().cards.find((c) => c.id === projectId);
      },
    }),
    {
      name: 'project-store',
    }
  )
);
