/*
# Classe Digital — Esquema Inicial v3.1

## Visão Geral
Cria o esquema completo do aplicativo de organização de estudos EAD "Classe Digital".
Todos os dados são isolados por usuário (multi-tenant via auth.uid()), com RLS habilitado em todas as tabelas.

## Novas Tabelas

1. `profiles` — Dados públicos do usuário (nome, avatar)
   - `id` (uuid, PK, referência a auth.users)
   - `full_name` (text)
   - `avatar_url` (text)
   - `created_at` (timestamptz)

2. `categories` — Categorias de cursos criadas pelo usuário
   - `id`, `user_id`, `name`, `color`, `sort_order`, `created_at`

3. `institutions` — Instituições/plataformas de ensino
   - `id`, `user_id`, `name`, `sort_order`, `created_at`

4. `courses` — Cursos cadastrados pelo usuário
   - `id`, `user_id`, `title`, `category_id` (FK), `institution_id` (FK)
   - `platform_url` (link direto), `notes` (anotações)
   - `status` (not_started / in_progress / completed / archived)
   - `is_favorite` (boolean)
   - `total_hours`, `total_modules`, `total_lessons` (metas do curso)
   - `completed_hours`, `completed_modules`, `completed_lessons` (progresso)
   - `sort_order`, `created_at`, `updated_at`

5. `study_logs` — Registro de sessões de estudo por curso e dia
   - `id`, `user_id`, `course_id` (FK), `date`, `minutes`, `modules_done`, `lessons_done`, `created_at`

6. `goals` — Metas de estudo do usuário
   - `id`, `user_id`, `title`, `type` (weekly_hours / daily_minutes / courses_count / modules_count)
   - `target_value`, `period` (daily/weekly/monthly/yearly)
   - `is_active`, `created_at`

7. `weekly_schedule` — Planejamento semanal (qual curso estudar em qual dia/bloco)
   - `id`, `user_id`, `course_id` (FK), `day_of_week` (0-6), `start_time`, `duration_minutes`, `sort_order`, `created_at`

8. `certificates` — Certificados por curso
   - `id`, `user_id`, `course_id` (FK), `title`, `file_url`, `issued_at`, `created_at`

9. `preferences` — Preferências de interface do usuário (tema futurista, efeitos, etc.)
   - `id`, `user_id` (único), `theme` (light/dark)
   - `futuristic_ui`, `glass_effect`, `animations`, `neon_effect`, `modern_icons`
   - `shadows`, `hover_effects`, `elevated_cards`, `dynamic_background` (booleans)
   - `updated_at`

## Segurança
- RLS habilitado em TODAS as tabelas.
- 4 políticas por tabela (SELECT/INSERT/UPDATE/DELETE) escopadas para `authenticated` com `auth.uid() = user_id`.
- Colunas `user_id` têm `DEFAULT auth.uid()` para que inserts do cliente funcionem sem passar o owner explicitamente.
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#3b82f6',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_categories" ON categories;
CREATE POLICY "select_own_categories" ON categories FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_categories" ON categories;
CREATE POLICY "insert_own_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_categories" ON categories;
CREATE POLICY "update_own_categories" ON categories FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_categories" ON categories;
CREATE POLICY "delete_own_categories" ON categories FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- INSTITUTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_institutions" ON institutions;
CREATE POLICY "select_own_institutions" ON institutions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_institutions" ON institutions;
CREATE POLICY "insert_own_institutions" ON institutions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_institutions" ON institutions;
CREATE POLICY "update_own_institutions" ON institutions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_institutions" ON institutions;
CREATE POLICY "delete_own_institutions" ON institutions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  institution_id uuid REFERENCES institutions(id) ON DELETE SET NULL,
  platform_url text,
  notes text,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','archived')),
  is_favorite boolean NOT NULL DEFAULT false,
  total_hours numeric DEFAULT 0,
  completed_hours numeric DEFAULT 0,
  total_modules integer DEFAULT 0,
  completed_modules integer DEFAULT 0,
  total_lessons integer DEFAULT 0,
  completed_lessons integer DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);

DROP POLICY IF EXISTS "select_own_courses" ON courses;
CREATE POLICY "select_own_courses" ON courses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_courses" ON courses;
CREATE POLICY "insert_own_courses" ON courses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_courses" ON courses;
CREATE POLICY "update_own_courses" ON courses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_courses" ON courses;
CREATE POLICY "delete_own_courses" ON courses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- STUDY_LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS study_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  minutes integer NOT NULL DEFAULT 0,
  modules_done integer NOT NULL DEFAULT 0,
  lessons_done integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_study_logs_user ON study_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_study_logs_date ON study_logs(date);
CREATE INDEX IF NOT EXISTS idx_study_logs_course ON study_logs(course_id);

DROP POLICY IF EXISTS "select_own_study_logs" ON study_logs;
CREATE POLICY "select_own_study_logs" ON study_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_study_logs" ON study_logs;
CREATE POLICY "insert_own_study_logs" ON study_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_study_logs" ON study_logs;
CREATE POLICY "update_own_study_logs" ON study_logs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_study_logs" ON study_logs;
CREATE POLICY "delete_own_study_logs" ON study_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- GOALS
-- ============================================================
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('weekly_hours','daily_minutes','courses_count','modules_count')),
  target_value numeric NOT NULL DEFAULT 0,
  period text NOT NULL DEFAULT 'weekly' CHECK (period IN ('daily','weekly','monthly','yearly')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_goals" ON goals;
CREATE POLICY "select_own_goals" ON goals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_goals" ON goals;
CREATE POLICY "insert_own_goals" ON goals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_goals" ON goals;
CREATE POLICY "update_own_goals" ON goals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_goals" ON goals;
CREATE POLICY "delete_own_goals" ON goals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- WEEKLY_SCHEDULE
-- ============================================================
CREATE TABLE IF NOT EXISTS weekly_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time text NOT NULL DEFAULT '08:00',
  duration_minutes integer NOT NULL DEFAULT 60,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE weekly_schedule ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_weekly_schedule_user ON weekly_schedule(user_id);

DROP POLICY IF EXISTS "select_own_weekly_schedule" ON weekly_schedule;
CREATE POLICY "select_own_weekly_schedule" ON weekly_schedule FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_weekly_schedule" ON weekly_schedule;
CREATE POLICY "insert_own_weekly_schedule" ON weekly_schedule FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_weekly_schedule" ON weekly_schedule;
CREATE POLICY "update_own_weekly_schedule" ON weekly_schedule FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_weekly_schedule" ON weekly_schedule;
CREATE POLICY "delete_own_weekly_schedule" ON weekly_schedule FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  title text NOT NULL,
  file_url text,
  issued_at date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_certificates" ON certificates;
CREATE POLICY "select_own_certificates" ON certificates FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_certificates" ON certificates;
CREATE POLICY "insert_own_certificates" ON certificates FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_certificates" ON certificates;
CREATE POLICY "update_own_certificates" ON certificates FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_certificates" ON certificates;
CREATE POLICY "delete_own_certificates" ON certificates FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- PREFERENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'light' CHECK (theme IN ('light','dark')),
  futuristic_ui boolean NOT NULL DEFAULT false,
  glass_effect boolean NOT NULL DEFAULT true,
  animations boolean NOT NULL DEFAULT true,
  neon_effect boolean NOT NULL DEFAULT false,
  modern_icons boolean NOT NULL DEFAULT true,
  shadows boolean NOT NULL DEFAULT true,
  hover_effects boolean NOT NULL DEFAULT true,
  elevated_cards boolean NOT NULL DEFAULT true,
  dynamic_background boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_preferences" ON preferences;
CREATE POLICY "select_own_preferences" ON preferences FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_preferences" ON preferences;
CREATE POLICY "insert_own_preferences" ON preferences FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_preferences" ON preferences;
CREATE POLICY "update_own_preferences" ON preferences FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_preferences" ON preferences;
CREATE POLICY "delete_own_preferences" ON preferences FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-create profile + preferences on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TRIGGER: update updated_at on courses
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS courses_updated_at ON courses;
CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
