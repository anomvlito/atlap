/**
 * Cliente HTTP autenticado para llamar a los endpoints /api/*.
 * Obtiene el JWT de Clerk y lo adjunta como Bearer token.
 *
 * Uso:
 *   const api = useApiClient()
 *   const sessions = await api.get('/api/sessions')
 *   const session  = await api.post('/api/sessions', { date: '2026-04-07', type: 'velocidad' })
 */
import { useAuth } from '@clerk/vue';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useApiClient() {
  const { getToken } = useAuth();

  async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = await getToken.value();

    const res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {})
      }
    });

    const json = (await res.json()) as ApiResponse<T>;
    if (!res.ok && json.error) {
      throw new Error(json.error);
    }
    return json;
  }

  return {
    get<T>(path: string) {
      return request<T>(path);
    },
    post<T>(path: string, body: unknown) {
      return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
    },
    patch<T>(path: string, body: unknown) {
      return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
    },
    delete<T>(path: string) {
      return request<T>(path, { method: 'DELETE' });
    }
  };
}
