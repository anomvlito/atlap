/**
 * Validación de JWT de Clerk en Vercel Functions.
 * Todos los endpoints deben llamar requireAuth() antes de acceder a datos.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';

export interface AuthContext {
  clerkId: string;
  userId?: string; // UUID interno de DB (se resuelve al consultar users)
}

export function getBearer(req: IncomingMessage): string | null {
  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

/**
 * Verifica el JWT de Clerk y devuelve el clerkId.
 * En desarrollo (NODE_ENV=development) acepta el header x-dev-clerk-id
 * para facilitar el testing sin token real.
 *
 * TODO: reemplazar la validación manual por @clerk/backend cuando
 * se configure el secret key en Vercel env vars.
 */
export async function requireAuth(req: IncomingMessage, res: ServerResponse): Promise<AuthContext | null> {
  if (process.env.NODE_ENV === 'development') {
    const devId = req.headers['x-dev-clerk-id'] as string | undefined;
    if (devId) return { clerkId: devId };
  }

  const token = getBearer(req);
  if (!token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ success: false, error: 'No autorizado' }));
    return null;
  }

  // TODO: validar JWT con @clerk/backend verifyToken()
  // Por ahora decodifica el payload sin verificar firma (solo desarrollo)
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!decoded.sub) throw new Error('sub ausente en JWT');
    return { clerkId: decoded.sub };
  } catch {
    res.statusCode = 401;
    res.end(JSON.stringify({ success: false, error: 'Token inválido' }));
    return null;
  }
}

export function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new Error('JSON inválido'));
      }
    });
  });
}

/** Extrae el segmento dinámico de la URL según un patrón.
 *  ej: getParam(req.url, '/api/sessions/', '/sensations') → id de sesión */
export function getParam(url: string | undefined, prefix: string, suffix = ''): string | null {
  if (!url) return null;
  const path = url.split('?')[0] ?? '';
  if (!path.startsWith(prefix)) return null;
  const rest = path.slice(prefix.length);
  const val = suffix ? rest.replace(suffix, '') : rest;
  return val || null;
}
