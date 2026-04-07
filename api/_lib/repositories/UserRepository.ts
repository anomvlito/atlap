import { eq } from 'drizzle-orm'
import { db, users, type User, type NewUser } from '../db.js'

export const UserRepository = {
  async findByClerkId(clerkId: string): Promise<User | null> {
    const [row] = await db.select().from(users).where(eq(users.clerkId, clerkId))
    return row ?? null
  },

  async findById(id: string): Promise<User | null> {
    const [row] = await db.select().from(users).where(eq(users.id, id))
    return row ?? null
  },

  async upsert(data: {
    clerkId: string
    email: string
    fullName?: string | null
  }): Promise<User> {
    const [row] = await db
      .insert(users)
      .values({ clerkId: data.clerkId, email: data.email, fullName: data.fullName ?? null })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: { email: data.email, fullName: data.fullName ?? null, updatedAt: new Date() }
      })
      .returning()
    return row!
  },

  async update(id: string, data: Partial<NewUser>): Promise<User> {
    const [row] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return row!
  }
}
