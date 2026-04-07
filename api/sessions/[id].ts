/**
 * GET    /api/sessions/:id  → detalle
 * PATCH  /api/sessions/:id  → actualizar
 * DELETE /api/sessions/:id  → eliminar
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireAuth, sendJson, readBody, getParam } from '../_lib/auth.js'
import { UserRepository } from '../_lib/repositories/UserRepository.js'
import { SessionRepository } from '../_lib/repositories/SessionRepository.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  const id = getParam(req.url, '/api/sessions/')
  if (!id) return sendJson(res, 400, { success: false, error: 'ID requerido' })

  const [user, session] = await Promise.all([
    UserRepository.findByClerkId(auth.clerkId),
    SessionRepository.findById(id)
  ])
  if (!user)    return sendJson(res, 404, { success: false, error: 'Usuario no encontrado' })
  if (!session) return sendJson(res, 404, { success: false, error: 'Sesión no encontrada' })
  if (session.athleteId !== user.id) return sendJson(res, 403, { success: false, error: 'Sin acceso' })

  if (req.method === 'GET') {
    return sendJson(res, 200, { success: true, data: session })
  }

  if (req.method === 'PATCH') {
    const body = await readBody(req)
    const allowed = ['date','type','plannedDistanceKm','plannedDurationMin','actualDurationMin','notes','completed','cycleId'] as const
    const update: Record<string, unknown> = {}
    for (const key of allowed) { if (key in body) update[key] = body[key] }
    const updated = await SessionRepository.update(id, update)
    return sendJson(res, 200, { success: true, data: updated })
  }

  if (req.method === 'DELETE') {
    await SessionRepository.delete(id)
    return sendJson(res, 200, { success: true })
  }

  sendJson(res, 405, { success: false, error: 'Método no permitido' })
}
