import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { db, trainingSessions, sessionSensations } from '../db.js'
import type { TrainingSession, NewTrainingSession, SessionSensations, NewSessionSensations } from '../db.js'
import type { Filters } from './base.js'

export const SessionRepository = {
  async findById(id: string): Promise<TrainingSession | null> {
    const [row] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, id))
    return row ?? null
  },

  async findByAthleteId(athleteId: string, filters: Filters = {}): Promise<TrainingSession[]> {
    const conditions = [eq(trainingSessions.athleteId, athleteId)]
    if (filters.from) conditions.push(gte(trainingSessions.date, filters.from))
    if (filters.to)   conditions.push(lte(trainingSessions.date, filters.to))

    return db
      .select()
      .from(trainingSessions)
      .where(and(...conditions))
      .orderBy(desc(trainingSessions.date))
      .limit(filters.limit ?? 100)
      .offset(filters.offset ?? 0)
  },

  async create(data: NewTrainingSession): Promise<TrainingSession> {
    const [row] = await db.insert(trainingSessions).values(data).returning()
    return row!
  },

  async update(id: string, data: Partial<NewTrainingSession>): Promise<TrainingSession> {
    const [row] = await db
      .update(trainingSessions)
      .set(data)
      .where(eq(trainingSessions.id, id))
      .returning()
    return row!
  },

  async delete(id: string): Promise<void> {
    await db.delete(trainingSessions).where(eq(trainingSessions.id, id))
  },

  // ── Sensaciones ────────────────────────────────────────────

  async getSensations(sessionId: string): Promise<SessionSensations | null> {
    const [row] = await db
      .select()
      .from(sessionSensations)
      .where(eq(sessionSensations.sessionId, sessionId))
    return row ?? null
  },

  async upsertSensations(
    sessionId: string,
    data: Omit<NewSessionSensations, 'sessionId'>
  ): Promise<SessionSensations> {
    const [row] = await db
      .insert(sessionSensations)
      .values({ ...data, sessionId })
      .onConflictDoUpdate({ target: sessionSensations.sessionId, set: data })
      .returning()
    return row!
  }
}
