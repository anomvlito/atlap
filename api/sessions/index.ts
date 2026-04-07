/**
 * GET  /api/sessions  → lista de sesiones del atleta autenticado
 * POST /api/sessions  → crear sesión
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireAuth, sendJson, readBody } from '../_lib/auth.js'
import { UserRepository } from '../_lib/repositories/UserRepository.js'
import { SessionRepository } from '../_lib/repositories/SessionRepository.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  const user = await UserRepository.findByClerkId(auth.clerkId)
  if (!user) return sendJson(res, 404, { success: false, error: 'Usuario no encontrado' })

  if (req.method === 'GET') {
    const url = new URL(req.url ?? '', 'http://localhost')
    const filters = {
      from:   url.searchParams.get('from')   ?? undefined,
      to:     url.searchParams.get('to')     ?? undefined,
      limit:  Number(url.searchParams.get('limit')  ?? 100),
      offset: Number(url.searchParams.get('offset') ?? 0)
    }
    const sessions = await SessionRepository.findByAthleteId(user.id, filters)
    return sendJson(res, 200, { success: true, data: sessions })
  }

  if (req.method === 'POST') {
    const body = await readBody(req)
    if (!body.date || !body.type) {
      return sendJson(res, 400, { success: false, error: 'date y type son requeridos' })
    }
    const session = await SessionRepository.create({
      athleteId:          user.id,
      cycleId:            (body.cycleId as string | undefined) ?? null,
      date:               body.date as string,
      type:               body.type as 'velocidad' | 'fondo' | 'tecnica' | 'fuerza' | 'mixto',
      plannedDistanceKm:  (body.plannedDistanceKm as string | undefined) ?? null,
      plannedDurationMin: (body.plannedDurationMin as number | undefined) ?? null,
      actualDurationMin:  (body.actualDurationMin  as number | undefined) ?? null,
      notes:              (body.notes  as string | undefined) ?? null,
      completed:          (body.completed as boolean | undefined) ?? false
    })
    return sendJson(res, 201, { success: true, data: session })
  }

  sendJson(res, 405, { success: false, error: 'Método no permitido' })
}
