import { pgTable, uuid, text, smallint, numeric, timestamp, boolean, date } from 'drizzle-orm/pg-core';

// ------------------------------------------------------------
// users
// Sincronizada con Clerk via clerk_id
// ------------------------------------------------------------
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').unique().notNull(),
  fullName: text('full_name'),
  role: text('role', { enum: ['athlete', 'coach', 'org_admin'] })
    .notNull()
    .default('athlete'),
  birthDate: date('birth_date'),
  height: smallint('height'),
  gender: text('gender', { enum: ['masculino', 'femenino', 'otro'] }),
  discipline: text('discipline'),
  onboarded: boolean('onboarded').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// ------------------------------------------------------------
// athlete_stats
// Un snapshot del hexágono (6 ejes) en un momento dado.
// overall es una columna GENERATED en la DB (no se inserta).
// ------------------------------------------------------------
export const athleteStats = pgTable('athlete_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),

  // Los 6 ejes del hexágono (0–100)
  velocidad: smallint('velocidad').notNull(),
  fisico: smallint('fisico').notNull(),
  tecnica: smallint('tecnica').notNull(),
  mental: smallint('mental').notNull(),
  recuperacion: smallint('recuperacion').notNull(),
  contexto: smallint('contexto').notNull(),

  // Columna generada en DB; Drizzle la lee pero no la escribe
  overall: numeric('overall', { precision: 4, scale: 1 }),

  notes: text('notes'),
  sessionId: uuid('session_id'), // FK futura → training_sessions
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AthleteStats = typeof athleteStats.$inferSelect;
export type NewAthleteStats = typeof athleteStats.$inferInsert;
