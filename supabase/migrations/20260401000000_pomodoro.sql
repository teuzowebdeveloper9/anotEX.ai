CREATE TABLE pomodoro_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  focus_duration_minutes SMALLINT NOT NULL DEFAULT 25,
  short_break_minutes SMALLINT NOT NULL DEFAULT 5,
  long_break_minutes SMALLINT NOT NULL DEFAULT 15,
  long_break_interval SMALLINT NOT NULL DEFAULT 4,
  auto_start_breaks BOOLEAN NOT NULL DEFAULT true,
  auto_start_focus BOOLEAN NOT NULL DEFAULT false,
  daily_focus_goal_minutes SMALLINT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'paused', 'awaiting_next_phase', 'stopped', 'completed', 'abandoned')),
  current_phase_type TEXT NOT NULL CHECK (current_phase_type IN ('focus', 'short_break', 'long_break')),
  current_cycle_sequence INTEGER NOT NULL DEFAULT 1,
  completed_focus_cycles INTEGER NOT NULL DEFAULT 0,
  completed_short_break_cycles INTEGER NOT NULL DEFAULT 0,
  completed_long_break_cycles INTEGER NOT NULL DEFAULT 0,
  focus_duration_minutes SMALLINT NOT NULL,
  short_break_minutes SMALLINT NOT NULL,
  long_break_minutes SMALLINT NOT NULL,
  long_break_interval SMALLINT NOT NULL,
  auto_start_breaks BOOLEAN NOT NULL,
  auto_start_focus BOOLEAN NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  phase_started_at TIMESTAMPTZ,
  phase_target_ends_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  current_phase_paused_ms INTEGER NOT NULL DEFAULT 0,
  total_paused_ms INTEGER NOT NULL DEFAULT 0,
  total_focus_ms INTEGER NOT NULL DEFAULT 0,
  total_break_ms INTEGER NOT NULL DEFAULT 0,
  context_type TEXT CHECK (context_type IN ('general', 'review', 'transcription', 'chat', 'study_folder')),
  context_id UUID,
  context_label TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pomodoro_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES pomodoro_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  phase_type TEXT NOT NULL CHECK (phase_type IN ('focus', 'short_break', 'long_break')),
  status TEXT NOT NULL CHECK (status IN ('running', 'paused', 'completed', 'stopped', 'skipped', 'abandoned')),
  planned_duration_ms INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  paused_total_ms INTEGER NOT NULL DEFAULT 0,
  effective_duration_ms INTEGER,
  completed_automatically BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, sequence)
);

ALTER TABLE pomodoro_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_pomodoro_settings"
  ON pomodoro_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_pomodoro_settings"
  ON pomodoro_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_pomodoro_settings"
  ON pomodoro_settings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_select_own_pomodoro_sessions"
  ON pomodoro_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_pomodoro_sessions"
  ON pomodoro_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_pomodoro_sessions"
  ON pomodoro_sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_select_own_pomodoro_cycles"
  ON pomodoro_cycles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_pomodoro_cycles"
  ON pomodoro_cycles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_pomodoro_cycles"
  ON pomodoro_cycles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_user_status ON pomodoro_sessions(user_id, status);
CREATE INDEX idx_pomodoro_sessions_user_started_at ON pomodoro_sessions(user_id, started_at DESC);
CREATE INDEX idx_pomodoro_cycles_user_id_started_at ON pomodoro_cycles(user_id, started_at DESC);
CREATE INDEX idx_pomodoro_cycles_session_id_sequence ON pomodoro_cycles(session_id, sequence);
CREATE UNIQUE INDEX uidx_pomodoro_sessions_one_active_per_user
  ON pomodoro_sessions(user_id)
  WHERE status IN ('running', 'paused', 'awaiting_next_phase');
