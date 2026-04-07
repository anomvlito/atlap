import { eq, and, desc } from 'drizzle-orm'
import { db, trainingCycles, scheduledSessions } from '../db.js'
import type { TrainingCycle, NewTrainingCycle, ScheduledSession, NewScheduledSession } from '../db.js'

export const CycleRepository = {
  async findById(id: string): Promise<TrainingCycle | null> {
    const [row] = await db.select().from(trainingCycles).where(eq(trainingCycles.id, id))
    return row ?? null
  },

  async findByAthleteId(athleteId: string): Promise<TrainingCycle[]> {
    return db
      .select()
      .from(trainingCycles)
      .where(eq(trainingCycles.athleteId, athleteId))
      .orderBy(desc(trainingCycles.startDate))
  },

  async findByCoachId(coachId: string): Promise<TrainingCycle[]> {
    return db
      .select()
      .from(trainingCycles)
      .where(eq(trainingCycles.coachId, coachId))
      .orderBy(desc(trainingCycles.startDate))
  },

  async create(data: NewTrainingCycle): Promise<TrainingCycle> {
    const [row] = await db.insert(trainingCycles).values(data).returning()
    return row!
  },

  async update(id: string, data: Partial<NewTrainingCycle>): Promise<TrainingCycle> {
    const [row] = await db
      .update(trainingCycles)
      .set(data)
      .where(eq(trainingCycles.id, id))
      .returning()
    return row!
  },

  async delete(id: string): Promise<void> {
    await db.delete(trainingCycles).where(eq(trainingCycles.id, id))
  },

  // ── Sesiones planificadas del ciclo ───────────────────────

  async getSchedule(cycleId: string): Promise<ScheduledSession[]> {
    return db
      .select()
      .from(scheduledSessions)
      .where(eq(scheduledSessions.cycleId, cycleId))
      .orderBy(scheduledSessions.date)
  },

  async addScheduledSession(data: NewScheduledSession): Promise<ScheduledSession> {
    const [row] = await db.insert(scheduledSessions).values(data).returning()
    return row!
  },

  async completeScheduledSession(
    id: string,
    sessionId: string
  ): Promise<ScheduledSession> {
    const [row] = await db
      .update(scheduledSessions)
      .set({ completed: true, sessionId })
      .where(eq(scheduledSessions.id, id))
      .returning()
    return row!
  }
}
