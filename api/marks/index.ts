/**
 * GET  /api/marks  → lista de marcas del atleta
 * POST /api/marks  → registrar nueva marca
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireAuth, sendJson, readBody } from '../_lib/auth.js'
import { UserRepository } from '../_lib/repositories/UserRepository.js'
import { MarkRepository } from '../_lib/repositories/MarkRepository.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  const user = await UserRepository.findByClerkId(auth.clerkId)
  if (!user) return sendJson(res, 404, { success: false, error: 'Usuario no encontrado' })

  if (req.method === 'GET') {
    const url = new URL(req.url ?? '', 'http://localhost')
    const marks = await MarkRepository.findByAthleteId(user.id, {
      discipline: url.searchParams.get('discipline') ?? undefined,
      from:       url.searchParams.get('from')       ?? undefined,
      to:         url.searchParams.get('to')         ?? undefined,
      limit:      Number(url.searchParams.get('limit')  ?? 200),
      offset:     Number(url.searchParams.get('offset') ?? 0)
    })
    return sendJson(res, 200, { success: true, data: marks })
  }

  if (req.method === 'POST') {
    const body = await readBody(req)
    if (!body.discipline || !body.resultValue || !body.resultUnit || !body.date) {
      return sendJson(res, 400, { success: false, error: 'discipline, resultValue, resultUnit y date son requeridos' })
    }
    const mark = await MarkRepository.create({
      athleteId:        user.id,
      discipline:       body.discipline       as string,
      resultValue:      String(body.resultValue),
      resultUnit:       body.resultUnit       as 'seconds' | 'meters',
      date:             body.date             as string,
      competition:      (body.competition      as string | undefined) ?? null,
      location:         (body.location         as string | undefined) ?? null,
      wind:             body.wind != null ? String(body.wind) : null,
      isPersonalRecord: (body.isPersonalRecord as boolean | undefined) ?? false
    })
    return sendJson(res, 201, { success: true, data: mark })
  }

  sendJson(res, 405, { success: false, error: 'Método no permitido' })
}
