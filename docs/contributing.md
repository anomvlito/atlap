# Contribuir

Guía rápida para contribuir al proyecto.

Branching y commits
- Crear una rama por feature/bug: `feat/<descripción>` o `fix/<descripción>`.
- Mensajes de commit en formato convencional: `feat: añadir X` o `fix: reparar Y`.

Checks locales (recomendado antes de PR)

```bash
npm install
npm run lint
npm run type-check
npm run test:unit
```

PR
- Abrir pull request contra `main` o `develop` según flujo del repositorio.
- Incluir descripción clara, screenshots si aplica y pasos para reproducir.

Review y Merge
- Añadir reviewers relevantes y esperar CI verde antes de merge.

Estándares
- TypeScript estricto: respetar tipos y evitar `any` innecesario.
- Linting y Prettier: ejecutar `npm run lint` y `npm run format`.
