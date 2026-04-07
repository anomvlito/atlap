-- ============================================================
-- ATLAP — Migration 0003: Domain Schema
-- Tablas de dominio completo: ciclos, sesiones, marcas,
-- sensaciones, ejercicios, hábitos, horario, relaciones coach
-- ============================================================

-- ─── Relaciones Coach-Atleta ────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_relations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'active', 'inactive')),
  started_at  DATE,
  ended_at    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (athlete_id, coach_id)
);

CREATE INDEX IF NOT EXISTS idx_coach_relations_athlete ON coach_relations(athlete_id);
CREATE INDEX IF NOT EXISTS idx_coach_relations_coach   ON coach_relations(coach_id);

-- ─── Ciclos de entrenamiento ─────────────────────────────────
CREATE TABLE IF NOT EXISTS training_cycles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_id    UUID        REFERENCES users(id),
  name        TEXT        NOT NULL,
  start_date  DATE        NOT NULL,
  end_date    DATE        NOT NULL,
  phase       TEXT        NOT NULL
                          CHECK (phase IN ('fuerza','potencia','competencia','descanso','vacaciones')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_training_cycles_athlete ON training_cycles(athlete_id);

-- ─── Sesiones de entrenamiento ──────────────────────────────
CREATE TABLE IF NOT EXISTS training_sessions (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id            UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_id              UUID        REFERENCES training_cycles(id),
  date                  DATE        NOT NULL,
  type                  TEXT        NOT NULL
                                    CHECK (type IN ('velocidad','fondo','tecnica','fuerza','mixto')),
  planned_distance_km   NUMERIC(5,2),
  planned_duration_min  SMALLINT,
  actual_duration_min   SMALLINT,
  notes                 TEXT,
  completed             BOOLEAN     NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_sessions_athlete ON training_sessions(athlete_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date    ON training_sessions(athlete_id, date DESC);

-- ─── Sensaciones por sesión (1:1) ───────────────────────────
CREATE TABLE IF NOT EXISTS session_sensations (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID        NOT NULL UNIQUE REFERENCES training_sessions(id) ON DELETE CASCADE,
  energy         SMALLINT    NOT NULL CHECK (energy    BETWEEN 1 AND 5),
  stress         SMALLINT    NOT NULL CHECK (stress    BETWEEN 1 AND 5),
  sleep          SMALLINT    NOT NULL CHECK (sleep     BETWEEN 1 AND 5),
  pre_text       TEXT,
  post_text      TEXT,
  context_notes  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Ejercicios por sesión ───────────────────────────────────
CREATE TABLE IF NOT EXISTS exercise_entries (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID        NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  category    TEXT        NOT NULL CHECK (category IN ('fuerza', 'carrera')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercise_entries_session ON exercise_entries(session_id);

-- ─── Series por ejercicio ────────────────────────────────────
CREATE TABLE IF NOT EXISTS exercise_sets (
  id            UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id      UUID     NOT NULL REFERENCES exercise_entries(id) ON DELETE CASCADE,
  reps          SMALLINT,
  weight_kg     NUMERIC(5,2),
  distance_m    NUMERIC(7,2),
  pace_sec_km   SMALLINT,
  duration_sec  SMALLINT,
  order_index   SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_exercise_sets_entry ON exercise_sets(entry_id);

-- ─── Marcas en competencia ───────────────────────────────────
CREATE TABLE IF NOT EXISTS marks (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  discipline         TEXT        NOT NULL,
  result_value       NUMERIC(8,3) NOT NULL,
  result_unit        TEXT        NOT NULL CHECK (result_unit IN ('seconds','meters')),
  date               DATE        NOT NULL,
  competition        TEXT,
  location           TEXT,
  wind               NUMERIC(4,2),
  is_personal_record BOOLEAN     NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marks_athlete    ON marks(athlete_id);
CREATE INDEX IF NOT EXISTS idx_marks_discipline ON marks(athlete_id, discipline);
CREATE INDEX IF NOT EXISTS idx_marks_date       ON marks(athlete_id, date DESC);

-- ─── Sensaciones por marca (1:1) ─────────────────────────────
CREATE TABLE IF NOT EXISTS mark_sensations (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  mark_id    UUID        NOT NULL UNIQUE REFERENCES marks(id) ON DELETE CASCADE,
  feeling    SMALLINT    NOT NULL CHECK (feeling BETWEEN 1 AND 5),
  pre_text   TEXT,
  post_text  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Hábitos y rutinas ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date            DATE        NOT NULL,
  type            TEXT        NOT NULL
                              CHECK (type IN ('kine','masaje','crioterapia','psicologia',
                                             'rutina_pre_comp','sueño_registro')),
  duration_min    SMALLINT,
  notes           TEXT,
  pre_competition BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_athlete ON habits(athlete_id);
CREATE INDEX IF NOT EXISTS idx_habits_date    ON habits(athlete_id, date DESC);

-- ─── Sesiones planificadas (horario) ─────────────────────────
CREATE TABLE IF NOT EXISTS scheduled_sessions (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id            UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_id              UUID        REFERENCES training_cycles(id),
  session_id            UUID        REFERENCES training_sessions(id),
  date                  DATE        NOT NULL,
  day_of_week           SMALLINT    NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  type                  TEXT        NOT NULL
                                    CHECK (type IN ('velocidad','fondo','tecnica','fuerza','mixto')),
  planned_distance_km   NUMERIC(5,2),
  planned_duration_min  SMALLINT,
  notes                 TEXT,
  completed             BOOLEAN     NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_athlete ON scheduled_sessions(athlete_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_date    ON scheduled_sessions(athlete_id, date);

-- ─── FK diferida: athlete_stats.session_id ───────────────────
ALTER TABLE athlete_stats
  ADD CONSTRAINT IF NOT EXISTS fk_athlete_stats_session
  FOREIGN KEY (session_id) REFERENCES training_sessions(id);
