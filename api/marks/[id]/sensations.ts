/**
 * GET  /api/marks/:id/sensations
 * POST /api/marks/:id/sensations → upsert
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireAuth, sendJson, readBody, getParam } from '../../_lib/auth'
import { UserRepository } from '../../_lib/repositories/UserRepository'
import { MarkRepository } from '../../_lib/repositories/MarkRepository'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  const markId = getParam(req.url, '/api/marks/', '/sensations')
  if (!markId) return sendJson(res, 400, { success: false, error: 'markId requerido' })

  const [user, mark] = await Promise.all([
    UserRepository.findByClerkId(auth.clerkId),
    MarkRepository.findById(markId)
  ])
  if (!user) return sendJson(res, 404, { success: false, error: 'Usuario no encontrado' })
  if (!mark) return sendJson(res, 404, { success: false, error: 'Marca no encontrada' })
  if (mark.athleteId !== user.id) return sendJson(res, 403, { success: false, error: 'Sin acceso' })

  if (req.method === 'GET') {
    const sensations = await MarkRepository.getSensations(markId)
    return sendJson(res, 200, { success: true, data: sensations })
  }

  if (req.method === 'POST') {
    const body = await readBody(req)
    if (body.feeling == null) {
      return sendJson(res, 400, { success: false, error: 'feeling es requerido' })
    }
    const sensations = await MarkRepository.upsertSensations(markId, {
      feeling:  body.feeling  as number,
      preText:  (body.preText  as string | undefined) ?? null,
      postText: (body.postText as string | undefined) ?? null
    })
    return sendJson(res, 200, { success: true, data: sensations })
  }

  sendJson(res, 405, { success: false, error: 'Método no permitido' })
}
