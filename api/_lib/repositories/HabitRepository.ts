import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { db, habits } from '../db'
import type { Habit, NewHabit } from '../db'
import type { Filters } from './base'

export const HabitRepository = {
  async findById(id: string): Promise<Habit | null> {
    const [row] = await db.select().from(habits).where(eq(habits.id, id))
    return row ?? null
  },

  async findByAthleteId(athleteId: string, filters: Filters = {}): Promise<Habit[]> {
    const conditions = [eq(habits.athleteId, athleteId)]
    if (filters.from) conditions.push(gte(habits.date, filters.from))
    if (filters.to)   conditions.push(lte(habits.date, filters.to))

    return db
      .select()
      .from(habits)
      .where(and(...conditions))
      .orderBy(desc(habits.date))
      .limit(filters.limit ?? 200)
      .offset(filters.offset ?? 0)
  },

  async create(data: NewHabit): Promise<Habit> {
    const [row] = await db.insert(habits).values(data).returning()
    return row!
  },

  async update(id: string, data: Partial<NewHabit>): Promise<Habit> {
    const [row] = await db
      .update(habits)
      .set(data)
      .where(eq(habits.id, id))
      .returning()
    return row!
  },

  async delete(id: string): Promise<void> {
    await db.delete(habits).where(eq(habits.id, id))
  }
}
