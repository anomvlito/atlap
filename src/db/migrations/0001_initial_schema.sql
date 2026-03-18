-- ============================================================
-- ATLAP - Schema inicial v1.0
-- Ejecutar en: console.neon.tech → SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- Tabla: users
-- Vinculada con Clerk via clerk_id
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id    TEXT        UNIQUE NOT NULL,
  email       TEXT        UNIQUE NOT NULL,
  full_name   TEXT,
  role        TEXT        NOT NULL DEFAULT 'athlete'
                          CHECK (role IN ('athlete', 'coach', 'org_admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------------------
-- Tabla: athlete_stats
-- Un snapshot del hexágono en un momento dado.
-- Ejes: velocidad, fisico, tecnica, mental, recuperacion, contexto (0-100)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS athlete_stats (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Los 6 ejes del hexágono (0–100)
  velocidad     SMALLINT    NOT NULL CHECK (velocidad     BETWEEN 0 AND 100),
  fisico        SMALLINT    NOT NULL CHECK (fisico        BETWEEN 0 AND 100),
  tecnica       SMALLINT    NOT NULL CHECK (tecnica       BETWEEN 0 AND 100),
  mental        SMALLINT    NOT NULL CHECK (mental        BETWEEN 0 AND 100),
  recuperacion  SMALLINT    NOT NULL CHECK (recuperacion  BETWEEN 0 AND 100),
  contexto      SMALLINT    NOT NULL CHECK (contexto      BETWEEN 0 AND 100),

  -- Score general: promedio de los 6 ejes
  overall       NUMERIC(4,1) GENERATED ALWAYS AS (
    ROUND((velocidad + fisico + tecnica + mental + recuperacion + contexto) / 6.0, 1)
  ) STORED,

  notes         TEXT,
  session_id    UUID,    -- FK futura → training_sessions
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_athlete_stats_user_id
  ON athlete_stats(user_id);

CREATE INDEX IF NOT EXISTS idx_athlete_stats_timeline
  ON athlete_stats(user_id, recorded_at DESC);
