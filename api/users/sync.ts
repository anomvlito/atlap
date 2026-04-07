/**
 * POST /api/users/sync
 * Webhook de Clerk: crea o actualiza el usuario en Neon al registrarse.
 * También puede llamarse manualmente desde el frontend al primer login.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireAuth, sendJson, readBody } from '../_lib/auth'
import { UserRepository } from '../_lib/repositories/UserRepository'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return sendJson(res, 405, { success: false, error: 'Método no permitido' })

  const auth = await requireAuth(req, res)
  if (!auth) return

  const body = await readBody(req)
  const email  = (body.email  as string) ?? ''
  const fullName = (body.fullName as string | undefined) ?? null

  if (!email) return sendJson(res, 400, { success: false, error: 'email requerido' })

  const user = await UserRepository.upsert({ clerkId: auth.clerkId, email, fullName })
  sendJson(res, 200, { success: true, data: user })
}
