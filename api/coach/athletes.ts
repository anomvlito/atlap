/**
 * GET  /api/coach/athletes  → atletas vinculados al coach autenticado
 * POST /api/coach/athletes  → invitar a un atleta (por email)
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { eq } from 'drizzle-orm'
import { requireAuth, sendJson, readBody } from '../_lib/auth'
import { UserRepository } from '../_lib/repositories/UserRepository'
import { CoachRepository } from '../_lib/repositories/CoachRepository'
import { db, users } from '../_lib/db'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  const user = await UserRepository.findByClerkId(auth.clerkId)
  if (!user) return sendJson(res, 404, { success: false, error: 'Usuario no encontrado' })
  if (user.role !== 'coach') return sendJson(res, 403, { success: false, error: 'Solo coaches pueden acceder a este endpoint' })

  if (req.method === 'GET') {
    const athletes = await CoachRepository.getAthletesForCoach(user.id)
    return sendJson(res, 200, { success: true, data: athletes })
  }

  if (req.method === 'POST') {
    const body = await readBody(req)
    const email = body.email as string | undefined
    if (!email) return sendJson(res, 400, { success: false, error: 'email del atleta es requerido' })

    const [athlete] = await db.select().from(users).where(eq(users.email, email))
    if (!athlete) return sendJson(res, 404, { success: false, error: 'Atleta no encontrado con ese email' })
    if (athlete.role !== 'athlete') return sendJson(res, 400, { success: false, error: 'El usuario no es un atleta' })

    const relation = await CoachRepository.invite(athlete.id, user.id)
    return sendJson(res, 201, { success: true, data: relation })
  }

  sendJson(res, 405, { success: false, error: 'Método no permitido' })
}
