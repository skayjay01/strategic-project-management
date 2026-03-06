export interface ProjectCard {
  id: string;
  title: string;
  duration: number; // days
  color: string; // hex
  description: string;
}

export interface TimelineItem {
  id: string;
  projectId: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string; // ISO date string (YYYY-MM-DD)
  row: number; // swim-lane index
}

export type ViewMode = 'day' | 'week' | 'month';
