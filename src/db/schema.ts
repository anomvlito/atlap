import {
  pgTable, uuid, text, smallint, numeric, timestamp, boolean, date, integer
} from 'drizzle-orm/pg-core'

// ─── users ───────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:         uuid('id').primaryKey().defaultRandom(),
  clerkId:    text('clerk_id').unique().notNull(),
  email:      text('email').unique().notNull(),
  fullName:   text('full_name'),
  role:       text('role', { enum: ['athlete', 'coach', 'org_admin'] }).notNull().default('athlete'),
  birthDate:  date('birth_date'),
  height:     smallint('height'),
  gender:     text('gender', { enum: ['masculino', 'femenino', 'otro'] }),
  discipline: text('discipline'),
  onboarded:  boolean('onboarded').notNull().default(false),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

// ─── athlete_stats ────────────────────────────────────────────────────────────
export const athleteStats = pgTable('athlete_stats', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recordedAt:   timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
  velocidad:    smallint('velocidad').notNull(),
  fisico:       smallint('fisico').notNull(),
  tecnica:      smallint('tecnica').notNull(),
  mental:       smallint('mental').notNull(),
  recuperacion: smallint('recuperacion').notNull(),
  contexto:     smallint('contexto').notNull(),
  // Columna generada en DB; Drizzle la lee pero no la escribe
  overall:      numeric('overall', { precision: 4, scale: 1 }),
  notes:        text('notes'),
  sessionId:    uuid('session_id'),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

// ─── coach_relations ─────────────────────────────────────────────────────────
export const coachRelations = pgTable('coach_relations', {
  id:         uuid('id').primaryKey().defaultRandom(),
  athleteId:  uuid('athlete_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  coachId:    uuid('coach_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status:     text('status', { enum: ['pending', 'active', 'inactive'] }).notNull().default('pending'),
  startedAt:  date('started_at'),
  endedAt:    date('ended_at'),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

// ─── training_cycles ─────────────────────────────────────────────────────────
export const trainingCycles = pgTable('training_cycles', {
  id:         uuid('id').primaryKey().defaultRandom(),
  athleteId:  uuid('athlete_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  coachId:    uuid('coach_id').references(() => users.id),
  name:       text('name').notNull(),
  startDate:  date('start_date').notNull(),
  endDate:    date('end_date').notNull(),
  phase:      text('phase', {
    enum: ['fuerza', 'potencia', 'competencia', 'descanso', 'vacaciones']
  }).notNull(),
  notes:      text('notes'),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

// ─── training_sessions ────────────────────────────────────────────────────────
export const trainingSessions = pgTable('training_sessions', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  athleteId:           uuid('athlete_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cycleId:             uuid('cycle_id').references(() => trainingCycles.id),
  date:                date('date').notNull(),
  type:                text('type', { enum: ['velocidad', 'fondo', 'tecnica', 'fuerza', 'mixto'] }).notNull(),
  plannedDistanceKm:   numeric('planned_distance_km', { precision: 5, scale: 2 }),
  plannedDurationMin:  smallint('planned_duration_min'),
  actualDurationMin:   smallint('actual_duration_min'),
  notes:               text('notes'),
  completed:           boolean('completed').notNull().default(false),
  createdAt:           timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

// ─── session_sensations ───────────────────────────────────────────────────────
export const sessionSensations = pgTable('session_sensations', {
  id:            uuid('id').primaryKey().defaultRandom(),
  sessionId:     uuid('session_id').notNull().unique().references(() => trainingSessions.id, { onDelete: 'cascade' }),
  energy:        smallint('energy').notNull(),
  stress:        smallint('stress').notNull(),
  sleep:         smallint('sleep').notNull(),
  preText:       text('pre_text'),
  postText:      text('post_text'),
  contextNotes:  text('context_notes'),  // variables fantasma
  createdAt:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

// ─── exercise_entries ─────────────────────────────────────────────────────────
export const exerciseEntries = pgTable('exercise_entries', {
  id:         uuid('id').primaryKey().defaultRandom(),
  sessionId:  uuid('session_id').notNull().references(() => trainingSessions.id, { onDelete: 'cascade' }),
  name:       text('name').notNull(),
  category:   text('category', { enum: ['fuerza', 'carrera'] }).notNull(),
  notes:      text('notes'),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

// ─── exercise_sets ────────────────────────────────────────────────────────────
export const exerciseSets = pgTable('exercise_sets', {
  id:           uuid('id').primaryKey().defaultRandom(),
  entryId:      uuid('entry_id').notNull().references(() => exerciseEntries.id, { onDelete: 'cascade' }),
  reps:         smallint('reps'),
  weightKg:     numeric('weight_kg', { precision: 5, scale: 2 }),
  distanceM:    numeric('distance_m', { precision: 7, scale: 2 }),
  paceSecKm:    smallint('pace_sec_km'),
  durationSec:  smallint('duration_sec'),
  orderIndex:   smallint('order_index').notNull().default(0)
})

// ─── marks ────────────────────────────────────────────────────────────────────
export const marks = pgTable('marks', {
  id:               uuid('id').primaryKey().defaultRandom(),
  athleteId:        uuid('athlete_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  discipline:       text('discipline').notNull(),
  resultValue:      numeric('result_value', { precision: 8, scale: 3 }).notNull(),
  resultUnit:       text('result_unit', { enum: ['seconds', 'meters'] }).notNull(),
  date:             date('date').notNull(),
  competition:      text('competition'),
  location:         text('location'),
  wind:             numeric('wind', { precision: 4, scale: 2 }),
  isPersonalRecord: boolean('is_personal_record').notNull().default(false),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

// ─── mark_sensations ──────────────────────────────────────────────────────────
export const markSensations = pgTable('mark_sensations', {
  id:        uuid('id').primaryKey().defaultRandom(),
  markId:    uuid('mark_id').notNull().unique().references(() => marks.id, { onDelete: 'cascade' }),
  feeling:   smallint('feeling').notNull(),
  preText:   text('pre_text'),
  postText:  text('post_text'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

// ─── habits ───────────────────────────────────────────────────────────────────
export const habits = pgTable('habits', {
  id:             uuid('id').primaryKey().defaultRandom(),
  athleteId:      uuid('athlete_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date:           date('date').notNull(),
  type:           text('type', {
    enum: ['kine', 'masaje', 'crioterapia', 'psicologia', 'rutina_pre_comp', 'sueño_registro']
  }).notNull(),
  durationMin:    smallint('duration_min'),
  notes:          text('notes'),
  preCompetition: boolean('pre_competition').notNull().default(false),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

// ─── scheduled_sessions ───────────────────────────────────────────────────────
export const scheduledSessions = pgTable('scheduled_sessions', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  athleteId:           uuid('athlete_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cycleId:             uuid('cycle_id').references(() => trainingCycles.id),
  sessionId:           uuid('session_id').references(() => trainingSessions.id),
  date:                date('date').notNull(),
  dayOfWeek:           smallint('day_of_week').notNull(),
  type:                text('type', { enum: ['velocidad', 'fondo', 'tecnica', 'fuerza', 'mixto'] }).notNull(),
  plannedDistanceKm:   numeric('planned_distance_km', { precision: 5, scale: 2 }),
  plannedDurationMin:  smallint('planned_duration_min'),
  notes:               text('notes'),
  completed:           boolean('completed').notNull().default(false),
  createdAt:           timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

// ─── Types ────────────────────────────────────────────────────────────────────
export type User              = typeof users.$inferSelect
export type NewUser           = typeof users.$inferInsert
export type AthleteStats      = typeof athleteStats.$inferSelect
export type NewAthleteStats   = typeof athleteStats.$inferInsert
export type CoachRelation     = typeof coachRelations.$inferSelect
export type NewCoachRelation  = typeof coachRelations.$inferInsert
export type TrainingCycle     = typeof trainingCycles.$inferSelect
export type NewTrainingCycle  = typeof trainingCycles.$inferInsert
export type TrainingSession   = typeof trainingSessions.$inferSelect
export type NewTrainingSession = typeof trainingSessions.$inferInsert
export type SessionSensations = typeof sessionSensations.$inferSelect
export type NewSessionSensations = typeof sessionSensations.$inferInsert
export type ExerciseEntry     = typeof exerciseEntries.$inferSelect
export type NewExerciseEntry  = typeof exerciseEntries.$inferInsert
export type ExerciseSet       = typeof exerciseSets.$inferSelect
export type NewExerciseSet    = typeof exerciseSets.$inferInsert
export type Mark              = typeof marks.$inferSelect
export type NewMark           = typeof marks.$inferInsert
export type MarkSensations    = typeof markSensations.$inferSelect
export type NewMarkSensations = typeof markSensations.$inferInsert
export type Habit             = typeof habits.$inferSelect
export type NewHabit          = typeof habits.$inferInsert
export type ScheduledSession  = typeof scheduledSessions.$inferSelect
export type NewScheduledSession = typeof scheduledSessions.$inferInsert

// ─── Tipos auxiliares ─────────────────────────────────────────────────────────
export type CyclePhase = 'fuerza' | 'potencia' | 'competencia' | 'descanso' | 'vacaciones'
export type UserRole   = 'athlete' | 'coach' | 'org_admin'
export type ResultUnit = 'seconds' | 'meters'
export type SessionType = 'velocidad' | 'fondo' | 'tecnica' | 'fuerza' | 'mixto'
