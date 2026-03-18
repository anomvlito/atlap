/**
 * Conexión a Neon PostgreSQL via HTTP driver.
 *
 * MVP: la DATABASE_URL se expone como VITE_ para acceso client-side.
 * TODO(producción): mover queries a server-side API (Vercel Functions / Nitro)
 * y usar Neon Authorize + Clerk JWTs + RLS policies para seguridad real.
 */
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(import.meta.env.VITE_DATABASE_URL)

export const db = drizzle(sql, { schema })

export * from './schema'
