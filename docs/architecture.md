# Arquitectura

Visión general
----------------
Atlap es una Single Page Application (SPA) con arquitectura frontend-first. Se apoya en servicios gestionados para autenticación y base de datos:

- Frontend: Vue 3 (Vite), componentes organizados por dominio (`components/`, `views/`), Pinia para estado global.
- Autenticación: Clerk (cliente). El app usa `@clerk/vue` para sesiones.
- Persistencia: Neon PostgreSQL con Drizzle ORM. Migraciones en `src/db/migrations`.

Estructura de carpetas (resumen)
- `src/components/` — UI compartida y componentes por feature.
- `src/views/` — páginas/rutas (Dashboard, Entrenamientos, Perfil, etc.).
- `src/stores/` — Pinia stores (ej. `athlete`, `auth`).
- `src/composables/` — composables reutilizables (`useCurrentUser`).
- `src/db/` — Drizzle schema y conexión Neon (actualmente usado en cliente; ver nota de seguridad).

Patrones y decisiones
- Lazy-loading de vistas en el router para optimizar bundle inicial.
- Uso de Drizzle como contrato de schema + migraciones SQL.
- Los stores usan datos `mock` para facilitar desarrollo offline.

Recomendaciones de evolución
- Mover la lógica de acceso a datos a un backend serverless (endpoints) para proteger credenciales y gestionar autorizaciones.
- Añadir una capa de caching y paginación para listas grandes (marcas, sesiones).
