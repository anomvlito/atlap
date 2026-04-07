/**
 * GET /api/athletes/insights
 * Retorna los insights de refuerzo positivo del atleta autenticado.
 * También accesible por el coach del atleta.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireAuth, sendJson } from '../_lib/auth'
import { UserRepository } from '../_lib/repositories/UserRepository'
import { generateInsights } from '../_lib/InsightsService'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') return sendJson(res, 405, { success: false, error: 'Método no permitido' })

  const auth = await requireAuth(req, res)
  if (!auth) return

  const user = await UserRepository.findByClerkId(auth.clerkId)
  if (!user) return sendJson(res, 404, { success: false, error: 'Usuario no encontrado' })

  const athleteId = user.role === 'coach'
    ? (new URL(req.url ?? '', 'http://localhost').searchParams.get('athleteId') ?? user.id)
    : user.id

  const insights = await generateInsights(athleteId)
  sendJson(res, 200, { success: true, data: insights })
}
