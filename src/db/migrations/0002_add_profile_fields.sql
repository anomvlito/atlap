-- Migration: 0002_add_profile_fields
-- Adds profile fields and onboarding flag to users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS height SMALLINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('masculino','femenino','otro'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS discipline TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarded BOOLEAN NOT NULL DEFAULT FALSE;
