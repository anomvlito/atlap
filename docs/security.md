# Seguridad — Consideraciones y acciones urgentes

Resumen rápido
--------------
La configuración actual expone la URL de la base de datos (`VITE_DATABASE_URL`) al cliente y usa el driver HTTP de Neon en código que se ejecuta en el navegador. Esto representa un riesgo crítico: cualquiera con acceso a la URL puede consultar o modificar la base de datos.

Riesgos detectados
- Exposición de credenciales y acceso directo a DB desde cliente.
- Ausencia de verificación server-side de tokens Clerk antes de ejecutar queries.
- Variables `VITE_` cargadas en cliente (cualquier `VITE_` es pública).

Medidas urgentes (prioridad alta)
--------------------------------
1. Mover TODO acceso a la base de datos a endpoints server-side (p. ej. Vercel Functions, Netlify Functions, Azure Functions o Nitro). El frontend debe llamar a esos endpoints.
2. En el backend, verificar el JWT de Clerk (token del cliente) antes de ejecutar queries y derivar el `clerk_id` desde el token.
3. Configurar Neon Authorize y Row-Level Security (RLS) para reforzar permisos a nivel de filas.
4. Eliminar `VITE_DATABASE_URL` del entorno del cliente en producción; usar variables server-only en la plataforma de despliegue.

Buenas prácticas
- Secrets: usar gestores de secretos o variables de entorno server-only; no almacenar secretos en repositorios.
- Logging: registrar eventos de seguridad y accesos sospechosos; integrar alertas si se detectan patrones anómalos.
- Principio de menor privilegio: el token usado por funciones debe tener permisos limitados.
- Sanitizar y validar inputs en backend (prevención de inyección SQL — aunque Drizzle ayuda, siempre validar).

Próximos pasos sugeridos
- Implementar endpoints mínimos: `GET /api/me`, `POST /api/profile`, `GET /api/athlete-stats`, `POST /api/athlete-stats` con verificación de Clerk.
- Añadir pruebas de integración que validen autenticación y permisos.
