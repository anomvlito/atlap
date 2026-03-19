---
name: vue-typescript-patterns
description: Vue 3 + TypeScript patterns to avoid lint errors and CI failures. Covers script setup, Chart.js types, oxlint/eslint config, and project structure isolation.
origin: atlap
---

# Vue 3 + TypeScript Patterns

Patrones aprendidos del proyecto atlap para evitar errores de lint y fallos en CI.

## When to Activate

- Escribiendo componentes Vue 3 con `<script setup>`
- Integrando Chart.js con vue-chartjs
- Configurando oxlint / eslint en un proyecto Vue
- Resolviendo errores `no-unused-vars` o `no-explicit-any` en CI

---

## `<script setup>` — Props y Variables

### No asignar `defineProps` si no se usa en el script

```typescript
// ❌ MAL — ESLint lo marca como no-unused-vars si props no se usa en el script
const props = defineProps<{ session: TrainingSession }>()

// ✅ BIEN — Vue expone las props al template automáticamente
defineProps<{ session: TrainingSession }>()
```

Si necesitas acceder a props en el script (e.g., para emits o computed), ahí sí asigna:

```typescript
const props = defineProps<{ session: TrainingSession }>()
const label = computed(() => props.session.type) // uso real
```

### Eliminar variables placeholder antes de commitear

```typescript
// ❌ MAL — genera no-unused-vars
const showForm = false // placeholder

// ✅ BIEN — si es placeholder, elimínalo o usa una directiva de template
```

---

## Chart.js — Tipos en lugar de `any`

Siempre importar `TooltipItem` de `chart.js` para tipear los callbacks de tooltips.

```typescript
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Tooltip,
  type TooltipItem    // ← importar el tipo
} from 'chart.js'
```

### Callbacks de tooltip

```typescript
// ❌ MAL
callbacks: {
  title: (items: any[]) => items[0].label,
  label: (item: any) => `${item.raw} m`,
}

// ✅ BIEN
callbacks: {
  title: (items: TooltipItem<'line'>[]) => items[0]?.label ?? '',
  label: (item: TooltipItem<'line'>) => `${item.raw} m`,
}

// Para gráficos de barras:
callbacks: { label: (item: TooltipItem<'bar'>) => ` ${item.raw} m` }
```

### Callback de eje Y (ticks)

```typescript
// ❌ MAL
ticks: { callback: (v: any) => `${v} m` }

// ✅ BIEN
ticks: { callback: (v: number | string) => `${v} m` }
```

### Registry de componentes dinámicos

```typescript
// ❌ MAL
const registry: Record<string, any> = { Activity, Trophy, ... }

// ✅ BIEN
const registry: Record<string, object> = { Activity, Trophy, ... }
```

---

## Configuración del Linter — Excluir directorios externos

Si el proyecto contiene carpetas de herramientas externas (e.g., `ecc/`, `scripts/`, plugins), excluirlas explícitamente.

### `eslint.config.ts`

```typescript
globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'ecc/**'])
```

### `package.json` — scripts de lint

```json
"lint:oxlint": "oxlint . --fix --ignore-pattern ecc/",
"lint:eslint": "eslint . --fix --cache --ignore-pattern ecc/"
```

### `vitest.config.ts` — excluir tests externos

```typescript
test: {
  exclude: [...configDefaults.exclude, 'e2e/**', 'ecc/**'],
}
```

> **Por qué**: Los directorios de tooling (como `ecc/`) tienen sus propios runners de test y patrones que no son compatibles con Vitest (usan `process.exit`). Incluirlos causa fallos en CI.

---

## Imports — Limpiar antes de commitear

```typescript
// ❌ MAL — type Mark importado pero no usado en el archivo
import {
  mockThrows,
  lucasNerviThrows,
  type Mark,           // ← oxlint: 'Mark' is imported but never used
  type TrainingSession,
} from '@/data/mock'

// ✅ BIEN — solo importar lo que se usa
import {
  mockThrows,
  lucasNerviThrows,
  type TrainingSession,
} from '@/data/mock'
```

**Tip**: Antes de hacer commit, ejecuta `npm run lint` localmente. El `--fix` de oxlint/eslint corrige automáticamente muchos problemas.

---

## Checklist pre-commit para Vue + TypeScript

- [ ] `npm run type-check` — sin errores TypeScript
- [ ] `npm run lint` — sin errores oxlint/eslint
- [ ] No hay `any` sin justificar (usar tipos específicos de Chart.js, `unknown`, o `object`)
- [ ] No hay variables asignadas que no se usan en el mismo scope
- [ ] Los directorios externos (`ecc/`) están excluidos del linter y de vitest
- [ ] `npm run build-only` — build limpio antes de PR
