/**
 * GET  /api/cycles  → ciclos del atleta autenticado
 * POST /api/cycles  → crear ciclo (atleta o coach)
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireAuth, sendJson, readBody } from '../_lib/auth.js'
import { UserRepository } from '../_lib/repositories/UserRepository.js'
import { CycleRepository } from '../_lib/repositories/CycleRepository.js'
import type { CyclePhase } from '../_lib/db.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  const user = await UserRepository.findByClerkId(auth.clerkId)
  if (!user) return sendJson(res, 404, { success: false, error: 'Usuario no encontrado' })

  if (req.method === 'GET') {
    const cycles = await CycleRepository.findByAthleteId(user.id)
    return sendJson(res, 200, { success: true, data: cycles })
  }

  if (req.method === 'POST') {
    const body = await readBody(req)
    if (!body.name || !body.startDate || !body.endDate || !body.phase) {
      return sendJson(res, 400, { success: false, error: 'name, startDate, endDate y phase son requeridos' })
    }
    // athleteId puede venir en el body si el coach crea para un atleta;
    // si no viene, se asume que el atleta crea su propio ciclo.
    const athleteId = (body.athleteId as string | undefined) ?? user.id
    const coachId   = user.role === 'coach' ? user.id : null

    const cycle = await CycleRepository.create({
      athleteId,
      coachId,
      name:      body.name      as string,
      startDate: body.startDate as string,
      endDate:   body.endDate   as string,
      phase:     body.phase     as CyclePhase,
      notes:     (body.notes     as string | undefined) ?? null
    })
    return sendJson(res, 201, { success: true, data: cycle })
  }

  sendJson(res, 405, { success: false, error: 'Método no permitido' })
}
