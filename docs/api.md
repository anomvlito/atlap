# Propuesta API server-side

Para cerrar el riesgo de exponer la base de datos, se propone una pequeña API server-side que encapsule queries y valide autenticación con Clerk.

Endpoints sugeridos

1. `GET /api/me`
   - Propósito: devolver perfil del usuario en la BD (por `clerk_id`).
   - Auth: verificar Clerk JWT.
   - Response: objeto `DbUser` (id, clerkId, email, fullName, role, discipline, onboarded, ...)

2. `POST /api/profile`
   - Propósito: crear/actualizar perfil de usuario.
   - Auth: verificar Clerk JWT y asegurar `clerk_id` coincida con token.
   - Body: `ProfileData` (fullName, birthDate, height, gender, discipline)

3. `GET /api/athlete-stats?userId=<id>&limit=<n>`
   - Propósito: obtener `athlete_stats` paginados.
   - Auth: verificar que el usuario está autorizado a ver `userId` (coach/org_admin o mismo usuario).

4. `POST /api/athlete-stats`
   - Propósito: crear snapshot de `athlete_stats`.
   - Auth: verificar Clerk JWT; validar payload.

Autenticación
- Usar la librería oficial de Clerk para verificar JWT en el servidor.
- Extraer `sub`/`id` del token para identificar `clerk_id`.

Seguridad y RLS
- Configurar policies RLS en Postgres (Neon) que permitan operaciones solo si `clerk_id` coincide o si el rol tiene permisos.
