# ATLAP — Plan de Arquitectura y Desarrollo

> Documento vivo. Refleja el estado actual del sistema y la hoja de ruta técnica acordada.
> Última actualización: 2026-04-07

---

## 1. Estado Actual — Qué Tenemos

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Frontend | Vue 3 + TypeScript + Pinia + Vue Router | Implementado |
| Estilos | Tailwind CSS v4 | Implementado |
| Auth | Clerk v2 (`@clerk/vue`) | Implementado |
| Base de datos | Neon PostgreSQL (serverless) | Parcial — 2 tablas |
| ORM + Migraciones | Drizzle ORM | Parcial |
| Datos | Mock en `src/data/mock.ts` | Implementado |
| Backend/API | Ninguno todavía | **Pendiente** |
| IA / LLM | Ninguno todavía | **Pendiente** |
| Notificaciones | Ninguno todavía | **Pendiente** |

### Tablas DB existentes

```
users              → id, clerk_id, email, full_name, role, birth_date,
                     height, gender, discipline, onboarded
athlete_stats      → id, user_id (FK), velocidad, fisico, tecnica,
                     mental, recuperacion, contexto, overall (GENERATED),
                     notes, session_id (FK futura)
```

### Problema crítico de seguridad actual

`src/db/index.ts` expone `VITE_DATABASE_URL` directo en el cliente — la conexión a Neon se hace desde el browser. Esto **debe resolverse** con una capa de API antes de producción.

---

## 2. Mapa de Servicios Externos

```
┌─────────────────────────────────────────────────────────────┐
│                     SERVICIOS EXTERNOS                       │
│                                                             │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Clerk    │  │    Neon      │  │   Claude / OpenAI    │ │
│  │  (Auth)    │  │ (PostgreSQL) │  │   (IA / LLM)         │ │
│  │            │  │              │  │                      │ │
│  │ ✅ Activo  │  │ ✅ Activo    │  │ ⏳ Fase 3            │ │
│  └────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                             │
│  ┌────────────────────┐  ┌─────────────────────────────┐   │
│  │  Twilio / WhatsApp │  │  WHOOP API (opcional)        │   │
│  │  Business API      │  │  (datos de sueño)            │   │
│  │                    │  │                              │   │
│  │ ⏳ Fase 4          │  │ ⏳ Fase 4 / Investigar       │   │
│  └────────────────────┘  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Flujo de Autenticación (Clerk → DB)

```
Usuario abre la app
        │
        ▼
App.vue carga
        │
        ▼
Clerk verifica sesión
        │
   ┌────┴────┐
   │         │
No sesión  Sesión activa
   │         │
   ▼         ▼
AuthView  useCurrentUser()
           consulta DB
               │
        ┌──────┴──────┐
        │             │
   Usuario NO      Usuario SÍ
   existe en DB    existe en DB
        │             │
        ▼             ▼
   INSERT users    ¿onboarded?
   (desde Clerk)       │
        │         ┌────┴────┐
        ▼         │         │
   OnboardingView No       Sí
   (2 pasos:      │         │
    grupo →       ▼         ▼
    disciplinas) UPDATE  AppLayout
                users    (app normal)
                onboarded=true
```

---

## 4. Flujo de Datos — Actual (con problema de seguridad)

```
Vue Component
      │
      ▼
Pinia Store  ←──── mock.ts (todos los datos)
      │
      ▼
src/db/index.ts
      │  ← ⚠️ DATABASE_URL expuesta en browser
      ▼
Neon PostgreSQL
```

---

## 5. Flujo de Datos — Objetivo (con API layer)

```
Vue Component
      │
      ▼
Pinia Store
      │
      ▼
src/services/  (capa de servicios — NO existe aún)
      │
      ▼
API Layer                         ← Vercel Functions / Nitro
(POST /api/sessions,              ← Valida JWT de Clerk server-side
 GET  /api/marks,                 ← Aplica RLS policies
 POST /api/sensations, ...)       ← Nunca expone DATABASE_URL
      │
      ▼
Drizzle ORM + Neon PostgreSQL
```

---

## 6. Modelo de Dominio — OOP (lo que necesitamos pensar)

### 6.1 Entidades (clases principales)

```
┌──────────────────────────────────────────────────┐
│                     User                         │
│  id, clerkId, email, role                        │
│  ── tiene ──▶  Athlete (si role = 'athlete')     │
│  ── tiene ──▶  Coach   (si role = 'coach')       │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│                    Athlete                       │
│  userId, disciplines[], birthDate, height        │
│  ── tiene muchos ──▶  TrainingSession[]          │
│  ── tiene muchos ──▶  Mark[]                     │
│  ── tiene muchos ──▶  Habit[]                    │
│  ── tiene muchos ──▶  ScheduledSession[]         │
│  ── tiene muchos ──▶  AthleteStats[]             │
│  ── tiene muchos ──▶  TrainingCycle[]            │
│  ── tiene uno   ──▶  CoachRelation (opcional)    │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│                 TrainingSession                  │
│  id, athleteId, date, type, durationMin          │
│  distanceKm, notes                               │
│  ── tiene uno ──▶  Sensations                    │
│  ── tiene muchos ──▶  ExerciseEntry[]            │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│                      Mark                       │
│  id, athleteId, discipline, resultValue          │
│  resultUnit, date, competition, location         │
│  ── tiene uno ──▶  MarkSensations                │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│                 TrainingCycle                    │
│  id, athleteId, name, startDate, endDate         │
│  phase (fuerza|potencia|competencia|descanso)    │
│  ── tiene muchos ──▶  ScheduledSession[]         │
│  ── calcula ──▶  MultifactorScore                │
└──────────────────────────────────────────────────┘
```

### 6.2 Value Objects (sin identidad propia)

```
Sensations         → energy(1-5), stress(1-5), sleep(1-5), pre, post
MarkSensations     → feeling(1-5), pre, post
MultifactorScore   → velocidad, fisico, tecnica, mental,
                     recuperacion, contexto  (los 6 ejes, 0-100)
MarkResult         → value, unit ('seconds'|'meters'), betterIs
ExerciseSet        → reps, weight, distance, pace, duration
```

### 6.3 Agregado raíz

`Athlete` es el **aggregate root** — toda operación de escritura que afecte sesiones, marcas, hábitos o ciclos debe hacerse a través del atleta. Nunca modificar sesiones directamente sin pasar por el contexto del atleta.

---

## 7. DB Schema — Completo (actual + pendiente)

### 7.1 Tablas existentes

```sql
users              (✅ existe)
athlete_stats      (✅ existe — snapshots del hexágono)
```

### 7.2 Tablas que hay que crear

```
training_cycles
─────────────────
id              UUID PK
athlete_id      UUID FK → users.id
name            TEXT
start_date      DATE
end_date        DATE
phase           ENUM(fuerza, potencia, competencia, descanso, vacaciones)
notes           TEXT
created_at      TIMESTAMPTZ

training_sessions
─────────────────
id              UUID PK
athlete_id      UUID FK → users.id
cycle_id        UUID FK → training_cycles.id (nullable)
date            DATE
type            ENUM(velocidad, fondo, tecnica, fuerza, mixto)
planned_distance_km  NUMERIC
planned_duration_min SMALLINT
actual_duration_min  SMALLINT
notes           TEXT
completed       BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ

session_sensations
──────────────────
id              UUID PK
session_id      UUID FK → training_sessions.id (UNIQUE — 1:1)
energy          SMALLINT (1-5)
stress          SMALLINT (1-5)
sleep           SMALLINT (1-5)
pre_text        TEXT
post_text       TEXT
context_notes   TEXT     ← variables fantasma: qué pasó ese día fuera del deporte
created_at      TIMESTAMPTZ

exercise_entries
────────────────
id              UUID PK
session_id      UUID FK → training_sessions.id
name            TEXT
category        ENUM(fuerza, carrera)
notes           TEXT
created_at      TIMESTAMPTZ

exercise_sets
─────────────
id              UUID PK
entry_id        UUID FK → exercise_entries.id
reps            SMALLINT
weight_kg       NUMERIC(5,2)
distance_m      NUMERIC(7,2)
pace_sec_km     SMALLINT
duration_sec    SMALLINT
order_index     SMALLINT

marks
─────
id              UUID PK
athlete_id      UUID FK → users.id
discipline      TEXT
result_value    NUMERIC(8,3)
result_unit     ENUM(seconds, meters)
date            DATE
competition     TEXT
location        TEXT
wind            NUMERIC(4,2)
is_personal_record  BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ

mark_sensations
───────────────
id              UUID PK
mark_id         UUID FK → marks.id (UNIQUE — 1:1)
feeling         SMALLINT (1-5)
pre_text        TEXT
post_text       TEXT
created_at      TIMESTAMPTZ

habits
──────
id              UUID PK
athlete_id      UUID FK → users.id
date            DATE
type            ENUM(kine, masaje, crioterapia, psicologia, rutina_pre_comp, sueño_registro)
duration_min    SMALLINT
notes           TEXT
pre_competition BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ

scheduled_sessions
──────────────────
id              UUID PK
athlete_id      UUID FK → users.id
cycle_id        UUID FK → training_cycles.id (nullable)
session_id      UUID FK → training_sessions.id (nullable — se llena cuando se completa)
date            DATE
day_of_week     SMALLINT (0-6)
type            ENUM(velocidad, fondo, tecnica, fuerza, mixto)
planned_distance_km  NUMERIC
planned_duration_min SMALLINT
notes           TEXT
completed       BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ

coach_relations
───────────────
id              UUID PK
athlete_id      UUID FK → users.id
coach_id        UUID FK → users.id
status          ENUM(pending, active, inactive)
started_at      DATE
ended_at        DATE
created_at      TIMESTAMPTZ
```

---

## 8. Capa de Servicios — Diseño (patrón Repository)

Cada entidad tendrá su repositorio siguiendo el patrón definido en el proyecto:

```
src/
├── services/
│   ├── repositories/
│   │   ├── UserRepository.ts          ← CRUD de users
│   │   ├── TrainingSessionRepository.ts
│   │   ├── MarkRepository.ts
│   │   ├── HabitRepository.ts
│   │   ├── ScheduleRepository.ts
│   │   └── AthleteStatsRepository.ts
│   ├── AthleteService.ts              ← lógica de negocio (aggregate root)
│   ├── InsightsService.ts             ← refuerzo positivo + correlaciones
│   ├── CycleService.ts                ← lógica de ciclos + multifactor
│   └── NotificationService.ts        ← WhatsApp/push (Fase 4)
```

Cada repositorio implementa la interfaz:

```typescript
interface Repository<T, CreateDto, UpdateDto> {
  findAll(filters?: Filters): Promise<T[]>
  findById(id: string): Promise<T | null>
  findByAthleteId(athleteId: string): Promise<T[]>
  create(data: CreateDto): Promise<T>
  update(id: string, data: UpdateDto): Promise<T>
  delete(id: string): Promise<void>
}
```

---

## 9. Flujo Completo — Feature: Refuerzo Positivo

```
AthleteService.getPositiveInsights(athleteId)
        │
        ▼
MarkRepository.findByAthleteId()
        │
        ▼
InsightsService.analyzeMarks(marks[])
        │
   ┌────┴──────────────────────────────────────────┐
   │                                               │
   ▼                                               ▼
¿Todas las marcas en                        ¿Racha de
 disciplina X sobre                          entrenamientos
 el percentil 80%?                           consecutivos?
   │                                               │
   ▼                                               ▼
Insight: "Todos tus                         Insight: "Llevas
lanzamientos desde                          N semanas sin
2018 superan 60m"                           fallar un día"
        │                                          │
        └──────────────┬───────────────────────────┘
                       ▼
             InsightDTO[] (lista de insights)
                       │
                       ▼
              PositiveInsights.vue
              (componente en DashboardView)
```

---

## 10. Flujo Completo — Feature: Espiral Multifactorial

```
CycleService.getMultifactorProgress(athleteId)
        │
        ▼
Obtener TrainingCycle[] (ordenados por fecha)
        │
        ▼
Por cada ciclo → calcular MultifactorScore
        │
   Inputs para el score:
   ├── sessions.sensations.energy     → eje: fisico
   ├── sessions.sensations.sleep      → eje: recuperacion
   ├── sessions.sensations.stress     → eje: mental
   ├── marks.resultValue (tendencia)  → eje: velocidad/tecnica
   ├── exercise_entries (progresión)  → eje: fisico
   └── sensations.context_notes (IA) → eje: contexto
        │
        ▼
MultifactorScore[] (un score por ciclo)
        │
        ▼
MultifactorRadar.vue (radar chart con Chart.js)
        │
        ▼
Narrativa generada:
"En este ciclo bajaste en fuerza pero
 subiste notablemente en técnica y disfrute"
```

---

## 11. Flujo Completo — Feature: Variables Fantasma (Fase 3)

```
Capa 1: Recolección
─────────────────────
SessionSensations.context_notes
        +
HabitRepository (sueño, kine, psicología)
        +
ScheduledSession (adherencia al plan)
        │
        ▼
Capa 2: Correlaciones simples (reglas)
─────────────────────────────────────
InsightsService.detectCorrelations()
        │
   ┌────┴────────────────────────────────────┐
   │                                         │
   ▼                                         ▼
Correlación fuerza/competencia:         Correlación sueño/marca:
"Eliminar pesas en semana de            "Cuando dormiste < 3
competencia mejoró tu marca"            horas, tus marcas bajaron
                                        un promedio de X%"
        │                                         │
        └──────────────┬──────────────────────────┘
                       ▼
        Capa 3: Alertas predictivas
        ──────────────────────────
        "Octubre: 3 competencias + contexto
         universitario intenso → revisar plan"
                       │
                       ▼
        Capa 4: Agente IA (Fase 3 avanzada)
        ────────────────────────────────────
        LLM analiza patrones cualitativos
        → responde como entrenador
        → NUNCA peyorativo
```

---

## 12. Flujo Completo — Feature: Mínimo Tiempo en Pantalla (Fase 4)

```
NotificationService.sendWeeklySummary(athleteId)
        │
        ▼
Compila insights positivos de la semana
        │
        ▼
Formatea mensaje (sin ser peyorativo)
        │
        ▼
   ┌────┴──────────────────┐
   │                       │
   ▼                       ▼
WhatsApp Business       Push Notification
(Twilio API)            (Web Push / PWA)
        │                       │
        └──────────┬────────────┘
                   ▼
        Atleta recibe resumen
        SIN abrir la app
                   │
                   ▼
        Check-in mínimo opcional:
        "¿Cómo dormiste? [1-5]"
        (responde por WhatsApp)
                   │
                   ▼
        Dato guardado automáticamente
        en session_sensations.sleep
```

---

## 13. Incompatibilidades Conocidas — Mock vs DB

| Dato en Mock | Equivalente en DB | Diferencia |
|---|---|---|
| `TrainingSession.type` | `training_sessions.type` | Mock incluye string, DB usa ENUM |
| `Mark.resultValue` + `resultUnit` | `marks.result_value` + `result_unit` | Compatible — hay que migrar |
| `Habit.type: HabitType` | `habits.type` ENUM | Falta `sueño_registro` en mock |
| `ScheduledSession.sessionId` | `scheduled_sessions.session_id` | Mock usa string opcional, DB usa UUID nullable |
| `TrainingSensations.sleep` | `session_sensations.sleep` | Compatible |
| `AthleteStats` (hexágono) | `athlete_stats` | ✅ Ya existe en DB |
| `TrainingCycle` | **No existe** | Concepto nuevo — agregar a mock y DB |
| `context_notes` | **No existe en mock** | Variable nueva — agregar a `session_sensations` |

---

## 14. Plan de Migración Mock → DB Real

```
Paso 1 — Crear tablas pendientes
        (migration 0003: training_cycles, training_sessions,
         session_sensations, marks, mark_sensations,
         exercise_entries, exercise_sets, habits,
         scheduled_sessions, coach_relations)

Paso 2 — Crear repositorios (src/services/repositories/)
        Primero con datos mock — misma interfaz que usará la DB

Paso 3 — Crear API layer
        Vercel Functions o Nitro (server-side)
        Validación JWT Clerk en cada endpoint
        Mover DATABASE_URL de VITE_ a server-only

Paso 4 — Conectar stores a servicios
        Reemplazar import de mock.ts por llamadas al service
        Mantener mock como fallback en development

Paso 5 — Habilitar RLS en Neon
        Políticas: usuario solo ve sus propios datos
        Coach ve datos de sus atletas relacionados
```

---

## 15. Decisiones Pendientes (a discutir)

| Decisión | Opciones | Impacto |
|---|---|---|
| API layer | Vercel Functions vs Nitro (Nuxt) vs Edge Functions | Alto — define seguridad |
| LLM para insights | Claude API vs OpenAI vs local (Ollama) | Alto — costo y privacidad |
| WhatsApp | Twilio vs WhatsApp Cloud API directa | Medio — costo y latencia |
| WHOOP | API oficial vs integración manual | Bajo — feature opcional |
| Ciclos de entrenamiento | ¿Los crea el atleta o el coach? ¿O los sugiere la IA? | Medio — UX |
| Agente entrenador | ¿Proactivo (envía mensajes) vs reactivo (responde)? | Alto — paradigma central |

---

## 16. Próximos Pasos Concretos

```
[ ] 1. Crear migration 0003 con todas las tablas pendientes
[ ] 2. Agregar TrainingCycle y context_notes a mock.ts (compatibilidad)
[ ] 3. Crear src/services/repositories/ con interfaz Repository<T>
[ ] 4. Implementar InsightsService (reglas simples, sin IA)
[ ] 5. Construir PositiveInsights.vue en DashboardView
[ ] 6. Crear MultifactorRadar.vue en AnalisisView
[ ] 7. Mover DATABASE_URL a servidor (API layer)
[ ] 8. Elegir e integrar LLM (decisión pendiente arriba)
[ ] 9. Integrar Twilio para WhatsApp (Fase 4)
```
