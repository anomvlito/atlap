/**
 * GET   /api/sessions/:id/sensations
 * POST  /api/sessions/:id/sensations  → crear o actualizar (upsert)
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireAuth, sendJson, readBody, getParam } from '../../_lib/auth'
import { UserRepository } from '../../_lib/repositories/UserRepository'
import { SessionRepository } from '../../_lib/repositories/SessionRepository'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  const sessionId = getParam(req.url, '/api/sessions/', '/sensations')
  if (!sessionId) return sendJson(res, 400, { success: false, error: 'sessionId requerido' })

  const [user, session] = await Promise.all([
    UserRepository.findByClerkId(auth.clerkId),
    SessionRepository.findById(sessionId)
  ])
  if (!user)    return sendJson(res, 404, { success: false, error: 'Usuario no encontrado' })
  if (!session) return sendJson(res, 404, { success: false, error: 'Sesión no encontrada' })
  if (session.athleteId !== user.id) return sendJson(res, 403, { success: false, error: 'Sin acceso' })

  if (req.method === 'GET') {
    const sensations = await SessionRepository.getSensations(sessionId)
    return sendJson(res, 200, { success: true, data: sensations })
  }

  if (req.method === 'POST') {
    const body = await readBody(req)
    if (body.energy == null || body.stress == null || body.sleep == null) {
      return sendJson(res, 400, { success: false, error: 'energy, stress y sleep son requeridos' })
    }
    const sensations = await SessionRepository.upsertSensations(sessionId, {
      energy:       body.energy       as number,
      stress:       body.stress       as number,
      sleep:        body.sleep        as number,
      preText:      (body.preText      as string | undefined) ?? null,
      postText:     (body.postText     as string | undefined) ?? null,
      contextNotes: (body.contextNotes as string | undefined) ?? null
    })
    return sendJson(res, 200, { success: true, data: sensations })
  }

  sendJson(res, 405, { success: false, error: 'Método no permitido' })
}
