export type CourseStatus = 'not_started' | 'in_progress' | 'completed' | 'archived';

export type GoalType = 'weekly_hours' | 'daily_minutes' | 'courses_count' | 'modules_count';
export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface Institution {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  title: string;
  category_id: string | null;
  institution_id: string | null;
  platform_url: string | null;
  notes: string | null;
  status: CourseStatus;
  is_favorite: boolean;
  total_hours: number;
  completed_hours: number;
  total_modules: number;
  completed_modules: number;
  total_lessons: number;
  completed_lessons: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  institution?: Institution | null;
}

export interface StudyLog {
  id: string;
  user_id: string;
  course_id: string;
  date: string;
  minutes: number;
  modules_done: number;
  lessons_done: number;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  type: GoalType;
  target_value: number;
  period: GoalPeriod;
  is_active: boolean;
  created_at: string;
}

export interface WeeklyScheduleItem {
  id: string;
  user_id: string;
  course_id: string;
  day_of_week: number;
  start_time: string;
  duration_minutes: number;
  sort_order: number;
  created_at: string;
  course?: Course | null;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string | null;
  title: string;
  file_url: string | null;
  issued_at: string | null;
  created_at: string;
  course?: Course | null;
}

export interface Preferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  futuristic_ui: boolean;
  glass_effect: boolean;
  animations: boolean;
  neon_effect: boolean;
  modern_icons: boolean;
  shadows: boolean;
  hover_effects: boolean;
  elevated_cards: boolean;
  dynamic_background: boolean;
  updated_at: string;
}

export const DEFAULT_PREFERENCES: Omit<Preferences, 'id' | 'user_id' | 'updated_at'> = {
  theme: 'light',
  futuristic_ui: false,
  glass_effect: true,
  animations: true,
  neon_effect: false,
  modern_icons: true,
  shadows: true,
  hover_effects: true,
  elevated_cards: true,
  dynamic_background: false,
};

export const STATUS_LABELS: Record<CourseStatus, string> = {
  not_started: 'Não iniciado',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  archived: 'Arquivado',
};

export const STATUS_COLORS: Record<CourseStatus, string> = {
  not_started: '#64748b',
  in_progress: '#3b82f6',
  completed: '#22c55e',
  archived: '#94a3b8',
};

export const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const DAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
