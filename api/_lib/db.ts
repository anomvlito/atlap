/**
 * Conexión a Neon PostgreSQL — SOLO SERVER SIDE.
 *
 * Este módulo solo debe importarse desde /api/ (Vercel Functions).
 * Nunca desde src/ — la DATABASE_URL no tiene prefijo VITE_ y no
 * se incluye en el bundle del cliente.
 */
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../../src/db/schema.js'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL no está configurada')

const sql = neon(url)
export const db = drizzle(sql, { schema })

export * from '../../src/db/schema.js'
