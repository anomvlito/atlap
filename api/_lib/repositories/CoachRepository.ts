import { eq, and, inArray } from 'drizzle-orm';
import { db, coachRelations, users } from '../db.js';
import type { CoachRelation, NewCoachRelation, User } from '../db.js';

export const CoachRepository = {
  async findRelation(athleteId: string, coachId: string): Promise<CoachRelation | null> {
    const [row] = await db
      .select()
      .from(coachRelations)
      .where(and(eq(coachRelations.athleteId, athleteId), eq(coachRelations.coachId, coachId)));
    return row ?? null;
  },

  async getAthletes(coachId: string): Promise<User[]> {
    const relations = await db
      .select()
      .from(coachRelations)
      .where(and(eq(coachRelations.coachId, coachId), eq(coachRelations.status, 'active')));

    if (!relations.length) return [];

    const athleteIds = relations.map(r => r.athleteId);
    return db.select().from(users).where(inArray(users.id, athleteIds));
  },

  async getAthletesForCoach(coachId: string): Promise<Array<User & { relationStatus: string }>> {
    const rows = await db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        birthDate: users.birthDate,
        height: users.height,
        gender: users.gender,
        discipline: users.discipline,
        onboarded: users.onboarded,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        relationStatus: coachRelations.status
      })
      .from(coachRelations)
      .innerJoin(users, eq(users.id, coachRelations.athleteId))
      .where(eq(coachRelations.coachId, coachId));
    return rows;
  },

  async invite(athleteId: string, coachId: string): Promise<CoachRelation> {
    const [row] = await db.insert(coachRelations).values({ athleteId, coachId, status: 'pending' }).onConflictDoNothing().returning();
    return row!;
  },

  async updateStatus(athleteId: string, coachId: string, status: 'active' | 'inactive'): Promise<CoachRelation> {
    const [row] = await db
      .update(coachRelations)
      .set({ status })
      .where(and(eq(coachRelations.athleteId, athleteId), eq(coachRelations.coachId, coachId)))
      .returning();
    return row!;
  }
};
