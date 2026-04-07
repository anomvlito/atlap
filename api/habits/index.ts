/**
 * GET  /api/habits  → lista de hábitos del atleta
 * POST /api/habits  → registrar hábito
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireAuth, sendJson, readBody } from '../_lib/auth.js'
import { UserRepository } from '../_lib/repositories/UserRepository.js'
import { HabitRepository } from '../_lib/repositories/HabitRepository.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  const user = await UserRepository.findByClerkId(auth.clerkId)
  if (!user) return sendJson(res, 404, { success: false, error: 'Usuario no encontrado' })

  if (req.method === 'GET') {
    const url = new URL(req.url ?? '', 'http://localhost')
    const habits = await HabitRepository.findByAthleteId(user.id, {
      from:   url.searchParams.get('from')   ?? undefined,
      to:     url.searchParams.get('to')     ?? undefined,
      limit:  Number(url.searchParams.get('limit')  ?? 200),
      offset: Number(url.searchParams.get('offset') ?? 0)
    })
    return sendJson(res, 200, { success: true, data: habits })
  }

  if (req.method === 'POST') {
    const body = await readBody(req)
    if (!body.date || !body.type) {
      return sendJson(res, 400, { success: false, error: 'date y type son requeridos' })
    }
    const habit = await HabitRepository.create({
      athleteId:      user.id,
      date:           body.date           as string,
      type:           body.type           as 'kine' | 'masaje' | 'crioterapia' | 'psicologia' | 'rutina_pre_comp' | 'sueño_registro',
      durationMin:    (body.durationMin    as number | undefined) ?? null,
      notes:          (body.notes          as string | undefined) ?? null,
      preCompetition: (body.preCompetition as boolean | undefined) ?? false
    })
    return sendJson(res, 201, { success: true, data: habit })
  }

  sendJson(res, 405, { success: false, error: 'Método no permitido' })
}
