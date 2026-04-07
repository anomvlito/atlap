/**
 * GET  /api/cycles/:id/schedule  → sesiones planificadas del ciclo
 * POST /api/cycles/:id/schedule  → agregar sesión planificada
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireAuth, sendJson, readBody, getParam } from '../../_lib/auth.js'
import { UserRepository } from '../../_lib/repositories/UserRepository.js'
import { CycleRepository } from '../../_lib/repositories/CycleRepository.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  const cycleId = getParam(req.url, '/api/cycles/', '/schedule')
  if (!cycleId) return sendJson(res, 400, { success: false, error: 'cycleId requerido' })

  const [user, cycle] = await Promise.all([
    UserRepository.findByClerkId(auth.clerkId),
    CycleRepository.findById(cycleId)
  ])
  if (!user)  return sendJson(res, 404, { success: false, error: 'Usuario no encontrado' })
  if (!cycle) return sendJson(res, 404, { success: false, error: 'Ciclo no encontrado' })

  // Acceso: el atleta o el coach del ciclo pueden ver/modificar
  const isOwner = cycle.athleteId === user.id
  const isCoach = cycle.coachId   === user.id
  if (!isOwner && !isCoach) return sendJson(res, 403, { success: false, error: 'Sin acceso' })

  if (req.method === 'GET') {
    const schedule = await CycleRepository.getSchedule(cycleId)
    return sendJson(res, 200, { success: true, data: schedule })
  }

  if (req.method === 'POST') {
    const body = await readBody(req)
    if (!body.date || !body.type || body.dayOfWeek == null) {
      return sendJson(res, 400, { success: false, error: 'date, type y dayOfWeek son requeridos' })
    }
    const session = await CycleRepository.addScheduledSession({
      athleteId:           cycle.athleteId,
      cycleId,
      sessionId:           null,
      date:                body.date       as string,
      dayOfWeek:           body.dayOfWeek  as number,
      type:                body.type       as 'velocidad' | 'fondo' | 'tecnica' | 'fuerza' | 'mixto',
      plannedDistanceKm:   body.plannedDistanceKm  != null ? String(body.plannedDistanceKm) : null,
      plannedDurationMin:  (body.plannedDurationMin as number | undefined) ?? null,
      notes:               (body.notes               as string | undefined) ?? null,
      completed:           false
    })
    return sendJson(res, 201, { success: true, data: session })
  }

  sendJson(res, 405, { success: false, error: 'Método no permitido' })
}
