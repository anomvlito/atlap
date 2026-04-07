# ATLAP — Plan de Arquitectura y Desarrollo

> Documento vivo. Refleja el estado actual del sistema y la hoja de ruta técnica acordada.
> Última actualización: 2026-04-07

---

## 1. Stack Definitivo

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Frontend | Vue 3 + TypeScript + Pinia + Vue Router | Implementado |
| Estilos | Tailwind CSS v4 | Implementado |
| Auth | Clerk v2 (`@clerk/vue`) | Implementado |
| Deploy | Vercel (SPA + Functions) | Parcial — solo SPA |
| Base de datos | Neon PostgreSQL (serverless) | Parcial — 2 tablas |
| ORM + Migraciones | Drizzle ORM | Parcial |
| API Layer | Vercel Functions (`/api/`) | **Pendiente** |
| Datos | Mock en `src/data/mock.ts` | Implementado |
| IA / LLM | Interfaz abstracta (modelo a elegir después) | **Pendiente** |
| Notificaciones | WhatsApp / Push | **Pendiente** |

### Decisiones tomadas

| Decisión | Elegido | Razón |
|---|---|---|
| DB | **Neon + Drizzle** | Definitivo. Eliminar `@supabase/supabase-js` |
| Auth | **Clerk** | Definitivo |
| API layer | **Vercel Functions** | Ya en Vercel, `vercel.json` existente |
| LLM | **Interfaz abstracta** | Permite cambiar Claude/OpenAI sin tocar lógica |
| Rol coach | **Crea y asigna** | Coach es actor colaborativo, no solo observador |

---

## 2. Mapa de Servicios

```
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICIOS EXTERNOS                          │
│                                                                  │
│  ┌──────────┐  ┌────────────────┐  ┌────────────────────────┐   │
│  │  Clerk   │  │     Neon       │  │  LLM (a definir)       │   │
│  │  (Auth)  │  │  PostgreSQL    │  │  Claude / OpenAI       │   │
│  │ ✅ Activo│  │  ✅ Activo     │  │  ⏳ Fase 3             │   │
│  └──────────┘  └────────────────┘  └────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────┐  ┌─────────────────────────────┐    │
│  │  Twilio / WhatsApp API │  │  WHOOP API (opcional)        │   │
│  │  ⏳ Fase 4             │  │  ⏳ Fase 4 / investigar      │   │
│  └────────────────────────┘  └─────────────────────────────┘    │
│                                                                  │
│  ❌ Supabase — eliminar del proyecto                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Roles y Permisos

```
┌───────────────────────────────────────────────────────┐
│                    ROLES (en tabla users)              │
│                                                        │
│  athlete       → ve su propio dashboard, registra     │
│                  sesiones, marcas, hábitos             │
│                                                        │
│  coach         → ve dashboard con lista de atletas,   │
│                  crea y asigna ciclos/sesiones,        │
│                  observa progreso de cada atleta       │
│                                                        │
│  org_admin     → gestión de organización (Fase futura) │
└───────────────────────────────────────────────────────┘

Permisos por recurso:

Recurso              │ Athlete (propio) │ Coach (atleta asignado) │ Coach (otros)
─────────────────────┼─────────────────┼─────────────────────────┼───────────────
training_sessions    │ CRUD            │ Read + Create           │ Sin acceso
marks                │ CRUD            │ Read                    │ Sin acceso
session_sensations   │ CRUD            │ Read                    │ Sin acceso
scheduled_sessions   │ Read + Complete │ CRUD                    │ Sin acceso
training_cycles      │ Read            │ CRUD                    │ Sin acceso
athlete_stats        │ Read            │ Read                    │ Sin acceso
habits               │ CRUD            │ Read                    │ Sin acceso
```

---

## 4. Flujo de Autenticación y Rol

```
Usuario abre la app
        │
        ▼
Clerk verifica sesión
        │
   ┌────┴────┐
   │         │
No sesión  Sesión activa
   │         │
   ▼         ▼
AuthView  useCurrentUser() consulta /api/users/me
               │
        ┌──────┴──────┐
        │             │
   No existe       Existe en DB
   en DB               │
        │          ┌───┴────────┐
        ▼          │            │
   POST /api/   onboarded=false  onboarded=true
   users/sync       │                │
   (crea user)      ▼                ▼
        │       OnboardingView   ¿Qué rol?
        │       (elige rol,          │
        │        disciplinas)    ┌───┴───┐
        │           │            │       │
        └───────────┘        Athlete   Coach
                             View      View
```

---

## 5. Flujo de Datos — Objetivo (API layer)

```
Vue Component / Pinia Store
        │
        ▼
src/services/          ← capa de servicios (a crear)
        │
        ▼
Vercel Functions  /api/...
        │  ← valida JWT de Clerk server-side
        │  ← aplica reglas de acceso por rol
        │  ← NUNCA expone DATABASE_URL al browser
        ▼
Drizzle ORM
        │
        ▼
Neon PostgreSQL
```

### Estructura de rutas API

```
/api/
├── users/
│   ├── me              GET, PATCH
│   └── sync            POST  (Clerk webhook → crea user en DB)
├── athletes/
│   └── [id]/
│       ├── stats        GET
│       └── insights     GET  (refuerzo positivo)
├── sessions/
│   ├── index            GET (list), POST (create)
│   └── [id]/
│       ├── index        GET, PATCH, DELETE
│       └── sensations   GET, POST, PATCH
├── marks/
│   ├── index            GET, POST
│   └── [id]/
│       ├── index        GET, PATCH, DELETE
│       └── sensations   GET, POST, PATCH
├── cycles/
│   ├── index            GET, POST
│   └── [id]/
│       ├── index        GET, PATCH, DELETE
│       └── schedule     GET, POST
├── habits/
│   └── index            GET, POST
├── exercises/
│   └── index            GET, POST
├── coach/
│   ├── athletes         GET  (lista de atletas del coach)
│   └── [athleteId]/
│       └── cycles       GET, POST  (coach asigna ciclos)
└── ai/
    └── insights         POST  (abstracción LLM)
```

---

## 6. Flujo Coach — Crea y Asigna

```
Coach inicia sesión
        │
        ▼
CoachDashboardView
  └── lista de atletas vinculados
        │
        ▼
Selecciona atleta → AthleteDetailView (coach view)
        │
        ├──▶ Ve marcas e historial del atleta (solo lectura)
        │
        ├──▶ Ve sensaciones y estado del atleta (solo lectura)
        │
        └──▶ Gestiona ciclos y planificación:
                │
                ▼
           TrainingCycleForm
           (nombre, fechas, fase)
                │
                ▼
           Asigna sesiones planificadas
           al ciclo del atleta
                │
                ▼
           El atleta ve en su app
           TabHorario con las sesiones
           que asignó el coach
                │
                ▼
           Atleta completa sesión
           → marca como completada
           → puede agregar sensaciones
                │
                ▼
           Coach ve el progreso actualizado
```

### Relación coach ↔ atleta en DB

```
coach_relations
────────────────
id              UUID PK
athlete_id      UUID FK → users.id
coach_id        UUID FK → users.id
status          ENUM(pending, active, inactive)
started_at      DATE
ended_at        DATE (nullable)
created_at      TIMESTAMPTZ

Flujo de vinculación:
Coach invita al atleta por email
  → se crea coach_relations con status='pending'
  → atleta acepta en su app
  → status='active'
```

---

## 7. Onboarding por Rol

```
Onboarding Atleta (flujo actual, extender):
─────────────────────────────────────────
Paso 1: Elegir grupo deportivo
Paso 2: Elegir disciplinas específicas
Paso 3 (nuevo): ¿Tenés entrenador en ATLAP?
  → Sí: ingresar código/email del coach
  → No: continuar solo
Paso 4 (nuevo): Datos de perfil (birthDate, height, gender)

Onboarding Coach (nuevo):
─────────────────────────
Paso 1: Confirmar rol como entrenador
Paso 2: Especialidad (velocidad, lanzamientos, fondo, etc.)
Paso 3: Organización o club (opcional)
Paso 4: Invitar primer atleta (opcional)
```

---

## 8. Abstracción LLM

```typescript
// src/services/ai/AIProvider.ts

interface AIInsightRequest {
  athleteId: string
  data: {
    marks: Mark[]
    sessions: TrainingSession[]
    sensations: SessionSensations[]
    habits: Habit[]
    contextNotes: string[]
  }
  promptType: 'positive_insights' | 'correlations' | 'cycle_summary' | 'coach_report'
}

interface AIInsightResponse {
  insights: string[]          // siempre positivos, nunca peyorativos
  correlations?: string[]     // variables fantasma detectadas
  suggestions?: string[]      // propuestas de ajuste
  rawResponse?: string
}

interface AIProvider {
  generateInsights(req: AIInsightRequest): Promise<AIInsightResponse>
}

// Implementaciones concretas:
// ClaudeProvider implements AIProvider  (Claude API)
// OpenAIProvider implements AIProvider  (GPT-4o)
// MockAIProvider implements AIProvider  (para development)
```

```
Flujo en la app:

Vue → /api/ai/insights (POST)
        │
        ▼
Vercel Function
        │
        ▼
AIProvider (interfaz)
        │
   ┌────┴────────────────┐
   │                     │
ClaudeProvider      OpenAIProvider
(claude-haiku       (gpt-4o-mini
 para análisis       para análisis
 de bajo costo)      de bajo costo)
```

**Regla fija en todos los providers**: el prompt del sistema siempre incluye la directiva de refuerzo positivo — la IA nunca genera mensajes peyorativos, de castigo o que comparen al atleta con un ideal inalcanzable.

---

## 9. Modelo de Dominio OOP

### Entidades

```
User
────
id, clerkId, email, role, fullName
birthDate, height, gender, onboarded
→ tiene uno: Athlete (si role='athlete')
→ tiene uno: Coach   (si role='coach')

Athlete
───────
userId, disciplines[], sport_group
→ aggregate root
→ tiene muchos: TrainingSession[]
→ tiene muchos: Mark[]
→ tiene muchos: Habit[]
→ tiene muchos: ScheduledSession[]
→ tiene muchos: AthleteStats[]
→ tiene muchos: TrainingCycle[]
→ tiene uno (opcional): CoachRelation

Coach
─────
userId, specialties[], club
→ tiene muchos: CoachRelation[]
→ tiene muchos: TrainingCycle[] (los que creó)

TrainingCycle
─────────────
id, athleteId, coachId (nullable), name
startDate, endDate
phase: fuerza | potencia | competencia | descanso | vacaciones
→ tiene muchos: ScheduledSession[]
→ calcula: MultifactorScore

TrainingSession
───────────────
id, athleteId, cycleId (nullable)
date, type, plannedDistanceKm, actualDurationMin
completed, notes
→ tiene uno: SessionSensations
→ tiene muchos: ExerciseEntry[]

Mark
────
id, athleteId, discipline, resultValue, resultUnit
date, competition, location, wind, isPersonalRecord
→ tiene uno: MarkSensations
```

### Value Objects (sin identidad)

```
SessionSensations   → energy(1-5), stress(1-5), sleep(1-5),
                      pre, post, contextNotes
MarkSensations      → feeling(1-5), pre, post
MultifactorScore    → velocidad, fisico, tecnica, mental,
                      recuperacion, contexto  (0-100 cada eje)
MarkResult          → value, unit, betterIs
ExerciseSet         → reps, weightKg, distanceM, paceSecKm, durationSec
AIInsight           → text, type, evidenceRefs[]
```

---

## 10. DB Schema Completo

### Tablas existentes (✅)

```sql
users              → id, clerk_id, email, full_name, role,
                     birth_date, height, gender, discipline, onboarded
athlete_stats      → id, user_id, velocidad, fisico, tecnica,
                     mental, recuperacion, contexto, overall (GENERATED), notes
```

### Tablas a crear (migration 0003+)

```sql
-- Relación coach-atleta
coach_relations (
  id              UUID PK DEFAULT gen_random_uuid(),
  athlete_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','active','inactive')),
  started_at      DATE,
  ended_at        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

-- Ciclos de entrenamiento
training_cycles (
  id              UUID PK DEFAULT gen_random_uuid(),
  athlete_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_id        UUID REFERENCES users(id),
  name            TEXT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  phase           TEXT NOT NULL
                  CHECK (phase IN ('fuerza','potencia','competencia','descanso','vacaciones')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

-- Sesiones realizadas
training_sessions (
  id              UUID PK DEFAULT gen_random_uuid(),
  athlete_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_id        UUID REFERENCES training_cycles(id),
  date            DATE NOT NULL,
  type            TEXT NOT NULL
                  CHECK (type IN ('velocidad','fondo','tecnica','fuerza','mixto')),
  planned_distance_km  NUMERIC(5,2),
  planned_duration_min SMALLINT,
  actual_duration_min  SMALLINT,
  notes           TEXT,
  completed       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

-- Sensaciones por sesión (1:1 con training_sessions)
session_sensations (
  id              UUID PK DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL UNIQUE REFERENCES training_sessions(id) ON DELETE CASCADE,
  energy          SMALLINT NOT NULL CHECK (energy BETWEEN 1 AND 5),
  stress          SMALLINT NOT NULL CHECK (stress BETWEEN 1 AND 5),
  sleep           SMALLINT NOT NULL CHECK (sleep BETWEEN 1 AND 5),
  pre_text        TEXT,
  post_text       TEXT,
  context_notes   TEXT,   -- variables fantasma: exámenes, viajes, estrés
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

-- Ejercicios por sesión
exercise_entries (
  id              UUID PK DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('fuerza','carrera')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

-- Series de cada ejercicio
exercise_sets (
  id              UUID PK DEFAULT gen_random_uuid(),
  entry_id        UUID NOT NULL REFERENCES exercise_entries(id) ON DELETE CASCADE,
  reps            SMALLINT,
  weight_kg       NUMERIC(5,2),
  distance_m      NUMERIC(7,2),
  pace_sec_km     SMALLINT,
  duration_sec    SMALLINT,
  order_index     SMALLINT NOT NULL DEFAULT 0
)

-- Marcas en competencia
marks (
  id              UUID PK DEFAULT gen_random_uuid(),
  athlete_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  discipline      TEXT NOT NULL,
  result_value    NUMERIC(8,3) NOT NULL,
  result_unit     TEXT NOT NULL CHECK (result_unit IN ('seconds','meters')),
  date            DATE NOT NULL,
  competition     TEXT,
  location        TEXT,
  wind            NUMERIC(4,2),
  is_personal_record BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

-- Sensaciones por marca (1:1 con marks)
mark_sensations (
  id              UUID PK DEFAULT gen_random_uuid(),
  mark_id         UUID NOT NULL UNIQUE REFERENCES marks(id) ON DELETE CASCADE,
  feeling         SMALLINT NOT NULL CHECK (feeling BETWEEN 1 AND 5),
  pre_text        TEXT,
  post_text       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

-- Hábitos y rutinas
habits (
  id              UUID PK DEFAULT gen_random_uuid(),
  athlete_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  type            TEXT NOT NULL
                  CHECK (type IN ('kine','masaje','crioterapia','psicologia',
                                  'rutina_pre_comp','sueño_registro')),
  duration_min    SMALLINT,
  notes           TEXT,
  pre_competition BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

-- Sesiones planificadas (horario / calendario)
scheduled_sessions (
  id              UUID PK DEFAULT gen_random_uuid(),
  athlete_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_id        UUID REFERENCES training_cycles(id),
  session_id      UUID REFERENCES training_sessions(id), -- se llena al completar
  date            DATE NOT NULL,
  day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  type            TEXT NOT NULL
                  CHECK (type IN ('velocidad','fondo','tecnica','fuerza','mixto')),
  planned_distance_km  NUMERIC(5,2),
  planned_duration_min SMALLINT,
  notes           TEXT,
  completed       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

---

## 11. Capa de Servicios (patrón Repository)

```
src/
├── services/
│   ├── repositories/
│   │   ├── UserRepository.ts
│   │   ├── TrainingSessionRepository.ts
│   │   ├── MarkRepository.ts
│   │   ├── HabitRepository.ts
│   │   ├── ScheduleRepository.ts
│   │   ├── CycleRepository.ts
│   │   └── AthleteStatsRepository.ts
│   ├── AthleteService.ts        ← aggregate root, lógica de negocio
│   ├── CoachService.ts          ← gestión de atletas y ciclos por coach
│   ├── InsightsService.ts       ← refuerzo positivo + correlaciones
│   ├── CycleService.ts          ← multifactor score, análisis de ciclos
│   ├── NotificationService.ts   ← WhatsApp/push (Fase 4)
│   └── ai/
│       ├── AIProvider.ts        ← interfaz abstracta
│       ├── ClaudeProvider.ts    ← implementación Claude
│       ├── OpenAIProvider.ts    ← implementación OpenAI
│       └── MockAIProvider.ts    ← para development/tests
```

Interfaz base de repositorio:

```typescript
interface Repository<T, CreateDto, UpdateDto> {
  findById(id: string): Promise<T | null>
  findByAthleteId(athleteId: string, filters?: Filters): Promise<T[]>
  create(data: CreateDto): Promise<T>
  update(id: string, data: UpdateDto): Promise<T>
  delete(id: string): Promise<void>
}
```

---

## 12. Incompatibilidades Mock → DB

| Mock actual | DB destino | Acción necesaria |
|---|---|---|
| `TrainingSensations` (en mock.ts) | `session_sensations` | Agregar `contextNotes` al tipo |
| `ScheduledSession.sessionId: string` | `scheduled_sessions.session_id: UUID` | Alinear tipo |
| `HabitType` sin `sueño_registro` | `habits.type` ENUM | Agregar a mock |
| `Mark.resultValue` + `resultUnit` | `marks.result_value` + `result_unit` | Compatible, solo renombrar |
| Sin `TrainingCycle` en mock | `training_cycles` | Crear tipo + datos mock |
| Sin `CoachRelation` | `coach_relations` | Crear tipo + mock para testing |
| `discipline` como `string` en users | `users.discipline` TEXT (CSV) | Compatible |

---

## 13. Pasos de Implementación

```
Fase 0 — Limpieza y fundamentos
[ ] Eliminar @supabase/supabase-js del proyecto
[ ] Mover VITE_DATABASE_URL a server-only (Vercel env var sin prefijo VITE_)
[ ] Agregar TrainingCycle y contextNotes a mock.ts
[ ] Crear migration 0003 con todas las tablas nuevas

Fase 1 — API layer + repositorios
[ ] Crear estructura /api/ en raíz (Vercel Functions)
[ ] Implementar middleware de auth (validar JWT Clerk)
[ ] Crear repositorios con interfaz Repository<T>
[ ] Endpoints: /api/users/me, /api/sessions, /api/marks, /api/habits
[ ] Endpoints coach: /api/coach/athletes, /api/cycles

Fase 2 — Refuerzo positivo (sin IA)
[ ] InsightsService con reglas simples (no LLM)
[ ] Endpoint /api/athletes/[id]/insights
[ ] PositiveInsights.vue en DashboardView

Fase 3 — Dashboard coach + onboarding expandido
[ ] CoachDashboardView.vue
[ ] Onboarding con selección de rol
[ ] Flujo de invitación coach → atleta
[ ] TrainingCycleForm.vue

Fase 4 — Espiral multifactorial
[ ] CycleService.getMultifactorScore()
[ ] MultifactorRadar.vue en AnalisisView
[ ] Narrativa de progreso por ciclo

Fase 5 — IA + variables fantasma
[ ] Interfaz AIProvider + MockAIProvider
[ ] Expandir SensationsForm con contextNotes
[ ] Correlaciones simples (reglas) → luego LLM
[ ] /api/ai/insights endpoint

Fase 6 — Notificaciones pasivas
[ ] NotificationService (WhatsApp/push)
[ ] Check-in mínimo por WhatsApp
[ ] Resumen semanal automático
```

---

## 14. Decisiones Pendientes

| Decisión | Estado |
|---|---|
| LLM: Claude vs OpenAI | Pendiente — abstraído, decidir en Fase 5 |
| WhatsApp: Twilio vs Cloud API directa | Pendiente — evaluar en Fase 6 |
| WHOOP API | Investigar — feature opcional |
| ¿Coach puede ver `context_notes` del atleta? | Definir — privacidad sensible |
| ¿Agente entrenador proactivo o reactivo? | Definir en Fase 5 |
