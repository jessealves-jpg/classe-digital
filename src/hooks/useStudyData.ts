import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Course, Category, Institution, StudyLog, Goal,
} from '@/types';

export function useStudyData() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const [cRes, catRes, instRes, lRes, gRes] = await Promise.all([
      supabase.from('courses').select('*, category:categories(*), institution:institutions(*)').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('institutions').select('*').order('sort_order'),
      supabase.from('study_logs').select('*'),
      supabase.from('goals').select('*').order('created_at', { ascending: false }),
    ]);
    if (cRes.data) setCourses(cRes.data as unknown as Course[]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    if (instRes.data) setInstitutions(instRes.data as Institution[]);
    if (lRes.data) setLogs(lRes.data as StudyLog[]);
    if (gRes.data) setGoals(gRes.data as Goal[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const addLog = useCallback(async (log: Partial<StudyLog>) => {
    const { data, error } = await supabase.from('study_logs').insert(log).select().single();
    if (error) return { error: error.message };
    setLogs((prev) => [...prev, data as StudyLog]);
    return { error: null };
  }, []);

  return { courses, categories, institutions, logs, goals, loading, addLog, reload: load };
}

export interface DashboardFilters {
  category: string;
  institution: string;
  status: string;
  year: string;
  month: string;
  favoritesOnly: boolean;
  completedOnly: boolean;
  archived: boolean;
}

export const DEFAULT_FILTERS: DashboardFilters = {
  category: 'all',
  institution: 'all',
  status: 'all',
  year: 'all',
  month: 'all',
  favoritesOnly: false,
  completedOnly: false,
  archived: false,
};

export function applyFilters(courses: Course[], filters: DashboardFilters): Course[] {
  return courses.filter((c) => {
    if (filters.category !== 'all' && c.category_id !== filters.category) return false;
    if (filters.institution !== 'all' && c.institution_id !== filters.institution) return false;
    if (filters.status !== 'all' && c.status !== filters.status) return false;
    if (filters.favoritesOnly && !c.is_favorite) return false;
    if (filters.completedOnly && c.status !== 'completed') return false;
    if (!filters.archived && c.status === 'archived') return false;
    return true;
  });
}
