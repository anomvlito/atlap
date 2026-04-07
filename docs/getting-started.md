# Getting Started — Desarrollo local

Esta guía explica cómo levantar el proyecto en modo desarrollo y los pasos básicos para contribuir.

Requisitos
- Node.js 20+ (recomendado)
- npm o pnpm
- Cuenta de Clerk (para probar autenticación) o usar mocks en desarrollo

Variables de entorno (ejemplo)
Crear un archivo `.env` en la raíz con las siguientes variables *solo para desarrollo*:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
VITE_DATABASE_URL=https://<neon-http-url>
```

Importante: `VITE_DATABASE_URL` se usa actualmente en cliente solo para desarrollo. En producción NO debe exponerse; implementar API server-side y usar credenciales server-only.

Instalación y ejecución

```bash
# instalar dependencias
npm install

# servidor de desarrollo
npm run dev

# ejecutar tests unitarios
npm run test:unit

# chequeo de tipos
npm run type-check

# lint
npm run lint
```

Estructura relevante
- `src/main.ts` — entrada app
- `src/App.vue` — layout y decisiones de routing/auth
- `src/router/index.ts` — rutas
- `src/stores` — estado con Pinia
- `src/views` — páginas principales
- `src/db` — Drizzle + Neon (migraciones en `src/db/migrations`)

Datos de prueba
El proyecto incluye `src/data/mock.ts` con datos para desarrollo. Úsalo para trabajar sin depender de la DB.
