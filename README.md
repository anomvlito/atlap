# Atlap

Aplicación web para seguimiento y análisis de atletas: panel de control, marcas, entrenamientos y métricas.

Resumen
-------
Atlap es una SPA construida con Vue 3 + Vite que provee vistas para gestionar atletas, entrenamientos y estadísticas. Usa Clerk para autenticación y Drizzle + Neon para persistencia de datos (migraciones SQL incluidas).

Características principales
--------------------------
- Autenticación con Clerk
- Gestión de perfiles y onboarding
- Panel de control con KPIs, últimas marcas y entrenamientos
- Persistencia en PostgreSQL (Neon) con Drizzle ORM y migraciones
- Arquitectura modular: `src/components`, `src/views`, `src/stores`, `src/db`

Stack tecnológico
-----------------
- Frontend: Vue 3, Pinia, Vue Router, Vite
- UI: TailwindCSS, lucide-vue-next, Chart.js
- Auth: Clerk (cliente)
- DB: Neon (Postgres) + Drizzle ORM
- Tests: Vitest

Riesgo de seguridad importante
-----------------------------
Actualmente el proyecto utiliza `VITE_DATABASE_URL` y el driver HTTP de Neon en código cliente (`src/composables/useCurrentUser.ts` y `src/db/index.ts`). Esto expone credenciales y acceso directo a la base de datos desde el navegador. Antes de desplegar a producción, hay que mover TODO el acceso a la base de datos a una capa server-side (serverless functions / API) y usar Clerk JWT + Neon Authorize + Row-Level Security (RLS).

Rápido inicio (desarrollo)
--------------------------
Requisitos:
- Node.js 20+ (recomendado)
- npm o pnpm

Clonar e instalar:

```bash
git clone <repo-url>
cd atlap
npm install
```

Variables de entorno (ejemplo)
-----------------------------
Crear un archivo `.env` o usar tu sistema de variables de entorno con las siguientes claves (solo para desarrollo):

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
VITE_DATABASE_URL=https://<neon-http-url>
```

Advertencia: las variables `VITE_` son visibles en el cliente. Nunca ponga credenciales sensibles para producción en variables con `VITE_` — use variables server-only en funciones.

Comandos útiles
---------------
- `npm run dev` — iniciar servidor de desarrollo
- `npm run build` — construir para producción
- `npm run preview` — vista previa del build
- `npm run test:unit` — ejecutar tests con Vitest
- `npm run lint` — ejecutar linters
- `npm run type-check` — chequeo de TypeScript
- `npm run db:generate|db:push|db:studio` — comandos de `drizzle-kit` para migraciones/schema

Contribuir
----------
Lee `docs/contributing.md` para el flujo de trabajo de desarrollo, pruebas y commits.

Más documentación
------------------
Ver la carpeta `docs/` para: guía de inicio detallada, arquitectura, consideraciones de seguridad y propuestas de API server-side.

Licencia
--------
Revisar `ecc/LICENSE` y `ecc/CONTRIBUTING.md` para detalles de licencia y aportes.

Contacto
-------
Para dudas técnicas abre un issue o contacta al equipo a través del repositorio.
