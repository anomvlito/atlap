/**
 * GET  /api/users/me  → datos del usuario autenticado
 * POST /api/users/me  → actualizar perfil
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { eq } from 'drizzle-orm'
import { db, users } from '../_lib/db.js'
import { requireAuth, sendJson } from '../_lib/auth.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  if (req.method === 'GET') {
    const [user] = await db.select().from(users).where(eq(users.clerkId, auth.clerkId))
    if (!user) return sendJson(res, 404, { success: false, error: 'Usuario no encontrado' })
    return sendJson(res, 200, { success: true, data: user })
  }

  if (req.method === 'PATCH') {
    const body = await readBody(req)
    const allowed = ['fullName', 'birthDate', 'height', 'gender', 'discipline', 'onboarded'] as const
    const update: Partial<typeof users.$inferInsert> = {}
    for (const key of allowed) {
      if (key in body) (update as Record<string, unknown>)[key] = body[key]
    }
    const [updated] = await db
      .update(users)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(users.clerkId, auth.clerkId))
      .returning()
    return sendJson(res, 200, { success: true, data: updated })
  }

  sendJson(res, 405, { success: false, error: 'Método no permitido' })
}

async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')) }
      catch { reject(new Error('JSON inválido')) }
    })
  })
}
