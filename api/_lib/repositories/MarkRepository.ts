import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { db, marks, markSensations } from '../db.js'
import type { Mark, NewMark, MarkSensations as MarkSensationsRow, NewMarkSensations } from '../db.js'
import type { Filters } from './base.js'

export const MarkRepository = {
  async findById(id: string): Promise<Mark | null> {
    const [row] = await db.select().from(marks).where(eq(marks.id, id))
    return row ?? null
  },

  async findByAthleteId(
    athleteId: string,
    filters: Filters & { discipline?: string } = {}
  ): Promise<Mark[]> {
    const conditions = [eq(marks.athleteId, athleteId)]
    if (filters.from)       conditions.push(gte(marks.date, filters.from))
    if (filters.to)         conditions.push(lte(marks.date, filters.to))
    if (filters.discipline) conditions.push(eq(marks.discipline, filters.discipline))

    return db
      .select()
      .from(marks)
      .where(and(...conditions))
      .orderBy(desc(marks.date))
      .limit(filters.limit ?? 200)
      .offset(filters.offset ?? 0)
  },

  async create(data: NewMark): Promise<Mark> {
    const [row] = await db.insert(marks).values(data).returning()
    return row!
  },

  async update(id: string, data: Partial<NewMark>): Promise<Mark> {
    const [row] = await db
      .update(marks)
      .set(data)
      .where(eq(marks.id, id))
      .returning()
    return row!
  },

  async delete(id: string): Promise<void> {
    await db.delete(marks).where(eq(marks.id, id))
  },

  // ── Sensaciones ────────────────────────────────────────────

  async getSensations(markId: string): Promise<MarkSensationsRow | null> {
    const [row] = await db
      .select()
      .from(markSensations)
      .where(eq(markSensations.markId, markId))
    return row ?? null
  },

  async upsertSensations(
    markId: string,
    data: Omit<NewMarkSensations, 'markId'>
  ): Promise<MarkSensationsRow> {
    const [row] = await db
      .insert(markSensations)
      .values({ ...data, markId })
      .onConflictDoUpdate({ target: markSensations.markId, set: data })
      .returning()
    return row!
  }
}
