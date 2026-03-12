export interface TrainingSensations {
  pre: string
  post: string
  energy: 1 | 2 | 3 | 4 | 5
  stress: 1 | 2 | 3 | 4 | 5
  sleep: 1 | 2 | 3 | 4 | 5
}

export interface MarkSensations {
  pre: string
  post: string
  feeling: 1 | 2 | 3 | 4 | 5
}

export interface ScheduledSession {
  id: string
  date: string
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  type: 'velocidad' | 'fondo' | 'tecnica' | 'fuerza'
  plannedDistanceKm: number
  plannedDurationMin: number
  notes?: string
  completed: boolean
  sessionId?: string
}

export interface ExerciseSet {
  reps?: number
  weight?: number
  distance?: string
  pace?: string
  duration?: number
}

export interface ExerciseEntry {
  id: string
  sessionId: string
  date: string
  name: string
  category: 'fuerza' | 'carrera'
  sets: ExerciseSet[]
  notes?: string
}

export type HabitType = 'kine' | 'masaje' | 'crioterapia' | 'psicologia' | 'rutina_pre_comp'

export interface Habit {
  id: string
  date: string
  type: HabitType
  durationMin?: number
  notes?: string
  preCompetition?: boolean
}

export interface MotivationalQuote {
  text: string
  author: string
}

export interface Athlete {
  id: string
  name: string
  age: number
  club: string
  avatar: string
  disciplines: string[]
  birthDate: string
  yearsActive: number
}

export interface Mark {
  id: string
  date: string
  competition: string
  discipline: string
  result: string
  resultSeconds: number
  ranking: number | null
  isPR: boolean
  sensations?: MarkSensations
}

export interface TrainingSession {
  id: string
  date: string
  type: 'velocidad' | 'fondo' | 'tecnica' | 'fuerza'
  distanceKm: number
  series?: string
  feeling: 1 | 2 | 3 | 4 | 5
  notes: string
  durationMin: number
  sensations?: TrainingSensations
}

export interface TeamMember {
  id: string
  name: string
  role: 'entrenador' | 'kinesiologo' | 'nutricionista' | 'psicologo'
  avatar: string
  lastActivity: string
  notes: string
}

export interface Rival {
  id: string
  name: string
  club: string
  marks: { date: string; discipline: string; resultSeconds: number }[]
}

// ─── ATLETA ──────────────────────────────────────────────────
export const mockAthlete: Athlete = {
  id: 'jp-001',
  name: 'Juan Pérez',
  age: 24,
  club: 'Club Atlético Santiago',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JuanPerez',
  disciplines: ['400m', '800m', '200m'],
  birthDate: '2001-05-14',
  yearsActive: 6,
}

// ─── HISTORIAL DE MARCAS ─────────────────────────────────────
export const mockMarks: Mark[] = [
  // 400m
  { id: 'm1', date: '2022-03-12', competition: 'Campeonato Regional', discipline: '400m', result: '49.8s', resultSeconds: 49.8, ranking: 3, isPR: false },
  { id: 'm2', date: '2022-06-18', competition: 'Copa Ciudad', discipline: '400m', result: '49.2s', resultSeconds: 49.2, ranking: 2, isPR: false },
  { id: 'm3', date: '2022-10-08', competition: 'Nacional Sub-23', discipline: '400m', result: '48.7s', resultSeconds: 48.7, ranking: 4, isPR: true },
  { id: 'm4', date: '2023-03-25', competition: 'Campeonato Regional', discipline: '400m', result: '48.5s', resultSeconds: 48.5, ranking: 2, isPR: true },
  {
    id: 'm5', date: '2023-07-01', competition: 'Clasificatorio ODESUR', discipline: '400m', result: '48.1s', resultSeconds: 48.1, ranking: 1, isPR: true,
    sensations: { pre: 'Nervioso pero concentrado, calentamiento perfecto', post: 'Increíble, primer lugar en clasificatorio', feeling: 5 },
  },
  { id: 'm6', date: '2023-10-14', competition: 'Nacional Absoluto', discipline: '400m', result: '47.9s', resultSeconds: 47.9, ranking: 2, isPR: true },
  {
    id: 'm7', date: '2024-02-20', competition: 'Open Verano', discipline: '400m', result: '48.2s', resultSeconds: 48.2, ranking: 1, isPR: false,
    sensations: { pre: 'Confiado, bien descansado', post: 'Buena carrera, contento con el tiempo', feeling: 4 },
  },
  {
    id: 'm8', date: '2024-05-11', competition: 'Gran Prix Santiago', discipline: '400m', result: '47.6s', resultSeconds: 47.6, ranking: 1, isPR: true,
    sensations: { pre: 'Muy activado, listo para competir', post: 'PR nuevo, eufórico con el resultado', feeling: 5 },
  },
  { id: 'm9', date: '2024-08-03', competition: 'Sudamericano', discipline: '400m', result: '47.3s', resultSeconds: 47.3, ranking: 3, isPR: true },
  {
    id: 'm10', date: '2024-10-19', competition: 'Nacional Absoluto', discipline: '400m', result: '47.5s', resultSeconds: 47.5, ranking: 2, isPR: false,
    sensations: { pre: 'Expectativa alta, algo de presión extra', post: 'No llegué al PR pero la segunda plaza está bien', feeling: 3 },
  },
  { id: 'm11', date: '2025-03-08', competition: 'Open Verano', discipline: '400m', result: '47.8s', resultSeconds: 47.8, ranking: 1, isPR: false },
  {
    id: 'm12', date: '2025-06-22', competition: 'Gran Prix Santiago', discipline: '400m', result: '47.1s', resultSeconds: 47.1, ranking: 1, isPR: true,
    sensations: { pre: 'El mejor calentamiento del año, todo alineado', post: 'PR histórico 47.1s — momento que no olvidaré', feeling: 5 },
  },
  // 800m
  { id: 'm13', date: '2022-04-09', competition: 'Copa Ciudad', discipline: '800m', result: '1:56.4', resultSeconds: 116.4, ranking: 2, isPR: false },
  {
    id: 'm14', date: '2023-04-15', competition: 'Regional', discipline: '800m', result: '1:54.8', resultSeconds: 114.8, ranking: 1, isPR: true,
    sensations: { pre: 'Relajado, sin presión extra', post: 'Victoria cómoda, nueva marca personal en 800m', feeling: 4 },
  },
  { id: 'm15', date: '2024-04-27', competition: 'Nacional', discipline: '800m', result: '1:52.3', resultSeconds: 112.3, ranking: 2, isPR: true },
  { id: 'm16', date: '2025-05-10', competition: 'Gran Prix', discipline: '800m', result: '1:51.9', resultSeconds: 111.9, ranking: 1, isPR: true },
  // 200m
  { id: 'm17', date: '2023-02-18', competition: 'Open Indoor', discipline: '200m', result: '22.1s', resultSeconds: 22.1, ranking: 3, isPR: false },
  { id: 'm18', date: '2024-02-10', competition: 'Open Indoor', discipline: '200m', result: '21.8s', resultSeconds: 21.8, ranking: 2, isPR: true },
  {
    id: 'm19', date: '2025-02-15', competition: 'Open Indoor', discipline: '200m', result: '21.5s', resultSeconds: 21.5, ranking: 1, isPR: true,
    sensations: { pre: 'Preparado, enfocado en la salida explosiva', post: 'Mejor tiempo en pista cubierta, muy contento', feeling: 5 },
  },
]

// ─── SESIONES DE ENTRENAMIENTO (últimos 30 días) ─────────────
const today = new Date()
const daysAgo = (n: number): string => {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0] as string
}

export const mockSessions: TrainingSession[] = [
  {
    id: 's1', date: daysAgo(1), type: 'velocidad', distanceKm: 8, series: '4x200m + 2x300m', feeling: 4, notes: 'Buena velocidad, piernas ligeras', durationMin: 75,
    sensations: { pre: 'Piernas listas, buena activación', post: 'Muy buena sesión, sensación real de velocidad', energy: 4, stress: 2, sleep: 4 },
  },
  { id: 's2', date: daysAgo(3), type: 'fondo', distanceKm: 14, series: undefined, feeling: 3, notes: 'Ritmo estable, algo de cansancio', durationMin: 80 },
  {
    id: 's3', date: daysAgo(4), type: 'fuerza', distanceKm: 0, series: '3x10 sentadillas + core', feeling: 5, notes: 'Excelente sesión de gimnasio', durationMin: 60,
    sensations: { pre: 'Algo cargado de los días anteriores', post: 'Fuerza OK, cuerpo resistió bien', energy: 3, stress: 3, sleep: 3 },
  },
  { id: 's4', date: daysAgo(6), type: 'velocidad', distanceKm: 7, series: '6x150m', feeling: 4, notes: 'Salidas explosivas', durationMin: 70 },
  {
    id: 's5', date: daysAgo(7), type: 'tecnica', distanceKm: 5, series: 'Drills de carrera', feeling: 4, notes: 'Trabajando frecuencia de paso', durationMin: 55,
    sensations: { pre: 'Mente despejada, listo para trabajar técnica', post: 'Técnica de curva mejorando notablemente', energy: 4, stress: 2, sleep: 5 },
  },
  { id: 's6', date: daysAgo(9), type: 'fondo', distanceKm: 16, series: undefined, feeling: 2, notes: 'Pesado hoy, no di el nivel', durationMin: 90 },
  {
    id: 's7', date: daysAgo(11), type: 'velocidad', distanceKm: 9, series: '3x300m + 4x100m', feeling: 5, notes: 'Muy buena sesión, marcas de entrenamiento', durationMin: 80,
    sensations: { pre: 'Excelente activación pre-entreno, cuerpo listo', post: 'Marcas de entrenamiento al límite, increíble', energy: 5, stress: 1, sleep: 5 },
  },
  { id: 's8', date: daysAgo(13), type: 'fuerza', distanceKm: 0, series: 'Pesas + pliometría', feeling: 4, notes: 'Buena potencia', durationMin: 65 },
  {
    id: 's9', date: daysAgo(14), type: 'fondo', distanceKm: 12, series: undefined, feeling: 3, notes: 'Rodaje tranquilo', durationMin: 65,
    sensations: { pre: 'Normal, sin motivación especial hoy', post: 'Bien, mantuve el ritmo todo el rodaje', energy: 3, stress: 3, sleep: 3 },
  },
  { id: 's10', date: daysAgo(16), type: 'velocidad', distanceKm: 8, series: '5x200m', feeling: 4, notes: 'Mejorando tiempos internos', durationMin: 72 },
  {
    id: 's11', date: daysAgo(18), type: 'tecnica', distanceKm: 4, series: 'Técnica de curva 400m', feeling: 3, notes: 'Trabajando el paso por curva', durationMin: 50,
    sensations: { pre: 'Cansado del ciclo de la semana', post: 'Trabajé bien a pesar del cansancio acumulado', energy: 2, stress: 4, sleep: 2 },
  },
  { id: 's12', date: daysAgo(20), type: 'fondo', distanceKm: 18, series: undefined, feeling: 4, notes: 'Largo del fin de semana, bien', durationMin: 100 },
  {
    id: 's13', date: daysAgo(22), type: 'velocidad', distanceKm: 7, series: '8x100m', feeling: 5, notes: 'Explosividad máxima', durationMin: 60,
    sensations: { pre: 'Activado, ganas de correr explosivo', post: 'Máxima explosividad del ciclo, excelente', energy: 5, stress: 2, sleep: 4 },
  },
  {
    id: 's14', date: daysAgo(24), type: 'fuerza', distanceKm: 0, series: 'Trabajo de tren inferior', feeling: 4, notes: 'Piernas fuertes', durationMin: 70,
    sensations: { pre: 'Piernas cargadas del día anterior', post: 'Buena sesión de fuerza base', energy: 3, stress: 3, sleep: 4 },
  },
  { id: 's15', date: daysAgo(27), type: 'fondo', distanceKm: 13, series: undefined, feeling: 3, notes: 'Ritmo aeróbico base', durationMin: 72 },
]

// ─── EQUIPO ──────────────────────────────────────────────────
export const mockTeam: TeamMember[] = [
  {
    id: 't1',
    name: 'Carlos Mendoza',
    role: 'entrenador',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosMendoza',
    lastActivity: daysAgo(1),
    notes: 'Análisis de la última competencia enviado. Revisar técnica de salida.',
  },
  {
    id: 't2',
    name: 'Ana Rodríguez',
    role: 'kinesiologo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnaRodriguez',
    lastActivity: daysAgo(3),
    notes: 'Protocolo de recuperación post-competencia actualizado. OK para entrenar.',
  },
  {
    id: 't3',
    name: 'Miguel Fuentes',
    role: 'nutricionista',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MiguelFuentes',
    lastActivity: daysAgo(5),
    notes: 'Plan de hidratación para período de carga. Aumentar carbohidratos.',
  },
]

// ─── RIVALES ─────────────────────────────────────────────────
export const mockRivals: Rival[] = [
  {
    id: 'r1',
    name: 'Pedro Álvarez',
    club: 'Club Maipú',
    marks: [
      { date: '2022-10-08', discipline: '400m', resultSeconds: 48.2 },
      { date: '2023-07-01', discipline: '400m', resultSeconds: 47.8 },
      { date: '2024-08-03', discipline: '400m', resultSeconds: 46.9 },
      { date: '2025-06-22', discipline: '400m', resultSeconds: 46.7 },
    ],
  },
  {
    id: 'r2',
    name: 'Diego Torres',
    club: 'Club Providencia',
    marks: [
      { date: '2022-10-08', discipline: '400m', resultSeconds: 49.1 },
      { date: '2023-07-01', discipline: '400m', resultSeconds: 48.6 },
      { date: '2024-08-03', discipline: '400m', resultSeconds: 48.0 },
      { date: '2025-06-22', discipline: '400m', resultSeconds: 47.4 },
    ],
  },
]

// ─── PRÓXIMA COMPETENCIA ─────────────────────────────────────
export const mockNextCompetition = {
  name: 'Gran Prix Nacional 2025',
  date: '2025-08-15',
  location: 'Estadio Nacional, Santiago',
  discipline: '400m',
}

// ─── KPIs DASHBOARD ─────────────────────────────────────────
export const mockKpis = {
  bestMark: { discipline: '400m', result: '47.1s', date: '2025-06-22' },
  lastSession: { daysAgo: 1, type: 'velocidad' as const },
  nextCompetition: mockNextCompetition,
  streak: 4,
}

// ─── FRASES MOTIVACIONALES ───────────────────────────────────
export const mockQuotes: MotivationalQuote[] = [
  { text: 'El dolor que sientes hoy es la fortaleza que sentirás mañana.', author: 'Arnold Schwarzenegger' },
  { text: 'Los campeones no se hacen en los gimnasios. Se hacen de algo que tienen dentro.', author: 'Muhammad Ali' },
  { text: 'No importa lo lento que vayas, siempre y cuando no te detengas.', author: 'Confucio' },
  { text: 'Cuando te canses, aprende a descansar, no a rendirte.', author: 'Banksy' },
  { text: 'La diferencia entre lo imposible y lo posible reside en la determinación.', author: 'Tommy Lasorda' },
  { text: 'No cuentes los días, haz que los días cuenten.', author: 'Muhammad Ali' },
  { text: 'El secreto del éxito es la consistencia en el propósito.', author: 'Benjamin Disraeli' },
  { text: 'Tu única competencia eres tú mismo de ayer.', author: 'Anónimo' },
  { text: 'La preparación es el secreto de todos los grandes atletas.', author: 'Roger Staubach' },
  { text: 'Los límites solo existen en la mente.', author: 'Michael Jordan' },
  { text: 'Cada entrenamiento te acerca un paso más a tu mejor versión.', author: 'Anónimo' },
  { text: 'La fatiga separa a los que quieren ganar de los que necesitan ganar.', author: 'Anónimo' },
  { text: 'El talento te lleva al torneo, pero el carácter te hace campeón.', author: 'Billie Jean King' },
  { text: 'No hay atajos hacia ningún lugar que valga la pena llegar.', author: 'Beverly Sills' },
  { text: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.', author: 'Robert Collier' },
  { text: 'El cuerpo logra lo que la mente cree posible.', author: 'Anónimo' },
  { text: 'Un atleta que ama el proceso nunca pierde, solo aprende.', author: 'Anónimo' },
  { text: 'La velocidad no es nada sin resistencia, la resistencia no es nada sin velocidad.', author: 'Anónimo' },
  { text: 'Cuando el cuerpo dice para, la mente dice sigue.', author: 'Anónimo' },
  { text: 'No te compares con nadie más. Eso sería insultar a tu propio camino.', author: 'Bill Gates' },
  { text: 'El atleta que más suda en el entrenamiento, menos sangra en la batalla.', author: 'Anónimo' },
  { text: 'Primero mejora al ser humano, luego al atleta.', author: 'Herb Elliott' },
  { text: 'No es sobre ser perfecto. Es sobre el esfuerzo. Y cuando traes ese esfuerzo cada día, eso es donde la transformación ocurre.', author: 'Jillian Michaels' },
  { text: 'Nunca te rindas porque un día estarás donde siempre quisiste estar.', author: 'Anónimo' },
  { text: 'El campeón no es solo el atleta más rápido. Es el que entrena más inteligente.', author: 'Anónimo' },
]

// ─── HORARIO PLANIFICADO (4 semanas) ─────────────────────────
export const mockSchedule: ScheduledSession[] = [
  // Semana 1 (9–15 mar 2026)
  { id: 'sch-1', date: '2026-03-09', dayOfWeek: 1, type: 'fondo', plannedDistanceKm: 14, plannedDurationMin: 80, notes: 'Rodaje aeróbico medio', completed: true, sessionId: 's2' },
  { id: 'sch-2', date: '2026-03-10', dayOfWeek: 2, type: 'velocidad', plannedDistanceKm: 8, plannedDurationMin: 75, notes: '4x200m + 2x300m', completed: true },
  { id: 'sch-3', date: '2026-03-11', dayOfWeek: 3, type: 'fuerza', plannedDistanceKm: 0, plannedDurationMin: 60, notes: 'Tren inferior + core', completed: true, sessionId: 's1' },
  { id: 'sch-4', date: '2026-03-13', dayOfWeek: 5, type: 'velocidad', plannedDistanceKm: 7, plannedDurationMin: 70, notes: '6x150m salidas', completed: false },
  { id: 'sch-5', date: '2026-03-14', dayOfWeek: 6, type: 'tecnica', plannedDistanceKm: 5, plannedDurationMin: 55, notes: 'Drills y frecuencia de paso', completed: false },
  // Semana 2 (16–22 mar 2026)
  { id: 'sch-6', date: '2026-03-16', dayOfWeek: 1, type: 'fondo', plannedDistanceKm: 16, plannedDurationMin: 90, notes: 'Largo semanal', completed: false },
  { id: 'sch-7', date: '2026-03-17', dayOfWeek: 2, type: 'velocidad', plannedDistanceKm: 9, plannedDurationMin: 80, notes: '3x300m + 4x100m', completed: false },
  { id: 'sch-8', date: '2026-03-18', dayOfWeek: 3, type: 'fuerza', plannedDistanceKm: 0, plannedDurationMin: 65, notes: 'Pesas + pliometría', completed: false },
  { id: 'sch-9', date: '2026-03-20', dayOfWeek: 5, type: 'velocidad', plannedDistanceKm: 8, plannedDurationMin: 75, notes: '5x200m progresivos', completed: false },
  { id: 'sch-10', date: '2026-03-21', dayOfWeek: 6, type: 'tecnica', plannedDistanceKm: 6, plannedDurationMin: 55, notes: 'Técnica de curva 400m', completed: false },
  // Semana 3 (23–29 mar 2026)
  { id: 'sch-11', date: '2026-03-23', dayOfWeek: 1, type: 'velocidad', plannedDistanceKm: 9, plannedDurationMin: 80, notes: '4x300m a ritmo de competencia', completed: false },
  { id: 'sch-12', date: '2026-03-24', dayOfWeek: 2, type: 'fondo', plannedDistanceKm: 14, plannedDurationMin: 78, notes: 'Rodaje aeróbico + cambios de ritmo', completed: false },
  { id: 'sch-13', date: '2026-03-25', dayOfWeek: 3, type: 'fuerza', plannedDistanceKm: 0, plannedDurationMin: 60, notes: 'Fuerza máxima tren inferior', completed: false },
  { id: 'sch-14', date: '2026-03-27', dayOfWeek: 5, type: 'velocidad', plannedDistanceKm: 10, plannedDurationMin: 85, notes: '2x400m + 4x200m', completed: false },
  { id: 'sch-15', date: '2026-03-28', dayOfWeek: 6, type: 'tecnica', plannedDistanceKm: 5, plannedDurationMin: 55, notes: 'Técnica de salida y aceleración', completed: false },
  // Semana 4 (30 mar – 5 abr 2026)
  { id: 'sch-16', date: '2026-03-30', dayOfWeek: 1, type: 'fondo', plannedDistanceKm: 18, plannedDurationMin: 100, notes: 'Largo de fin de ciclo', completed: false },
  { id: 'sch-17', date: '2026-03-31', dayOfWeek: 2, type: 'velocidad', plannedDistanceKm: 10, plannedDurationMin: 90, notes: '1x600m + 2x400m + 4x200m', completed: false },
  { id: 'sch-18', date: '2026-04-01', dayOfWeek: 3, type: 'fuerza', plannedDistanceKm: 0, plannedDurationMin: 65, notes: 'Mantenimiento fuerza + core', completed: false },
  { id: 'sch-19', date: '2026-04-03', dayOfWeek: 5, type: 'velocidad', plannedDistanceKm: 9, plannedDurationMin: 80, notes: '4x200m + 2x300m punta', completed: false },
  { id: 'sch-20', date: '2026-04-04', dayOfWeek: 6, type: 'tecnica', plannedDistanceKm: 5, plannedDurationMin: 55, notes: 'Repaso técnico pre-competencia', completed: false },
]

// ─── HISTORIAL DE EJERCICIOS ──────────────────────────────────
export const mockExercises: ExerciseEntry[] = [
  // s14 (fuerza, feb 16)
  { id: 'ex-1', sessionId: 's14', date: daysAgo(24), name: 'Sentadilla trasera', category: 'fuerza', sets: [{ reps: 10, weight: 100 }, { reps: 10, weight: 100 }, { reps: 8, weight: 105 }] },
  { id: 'ex-2', sessionId: 's14', date: daysAgo(24), name: 'Split squat', category: 'fuerza', sets: [{ reps: 8, weight: 65 }, { reps: 8, weight: 65 }, { reps: 8, weight: 70 }] },
  { id: 'ex-3', sessionId: 's14', date: daysAgo(24), name: 'Peso muerto rumano', category: 'fuerza', sets: [{ reps: 10, weight: 90 }, { reps: 10, weight: 90 }, { reps: 8, weight: 95 }] },
  // s13 (velocidad, feb 18)
  { id: 'ex-4', sessionId: 's13', date: daysAgo(22), name: '100m sprint', category: 'carrera', sets: [{ distance: '100m', duration: 12.1 }, { distance: '100m', duration: 11.9 }, { distance: '100m', duration: 11.8 }, { distance: '100m', duration: 11.9 }, { distance: '100m', duration: 12.0 }, { distance: '100m', duration: 11.7 }, { distance: '100m', duration: 11.8 }, { distance: '100m', duration: 12.0 }], notes: '8x100m con 3min descanso' },
  // s8 (fuerza, feb 27)
  { id: 'ex-5', sessionId: 's8', date: daysAgo(13), name: 'Sentadilla trasera', category: 'fuerza', sets: [{ reps: 10, weight: 102 }, { reps: 8, weight: 107 }, { reps: 6, weight: 112 }] },
  { id: 'ex-6', sessionId: 's8', date: daysAgo(13), name: 'Power clean', category: 'fuerza', sets: [{ reps: 5, weight: 80 }, { reps: 5, weight: 80 }, { reps: 5, weight: 82 }, { reps: 4, weight: 85 }] },
  { id: 'ex-7', sessionId: 's8', date: daysAgo(13), name: 'Saltos al cajón', category: 'fuerza', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }], notes: 'Cajón 60cm' },
  // s10 (velocidad, feb 24)
  { id: 'ex-8', sessionId: 's10', date: daysAgo(16), name: '200m sprint', category: 'carrera', sets: [{ distance: '200m', duration: 24.8 }, { distance: '200m', duration: 24.5 }, { distance: '200m', duration: 24.3 }, { distance: '200m', duration: 24.6 }, { distance: '200m', duration: 24.9 }], notes: '5x200m con 4min descanso' },
  // s7 (velocidad, mar 1)
  { id: 'ex-9', sessionId: 's7', date: daysAgo(11), name: '300m sprint', category: 'carrera', sets: [{ distance: '300m', duration: 36.8 }, { distance: '300m', duration: 36.2 }, { distance: '300m', duration: 36.0 }], notes: '3x300m con 6min descanso' },
  { id: 'ex-10', sessionId: 's7', date: daysAgo(11), name: '100m sprint', category: 'carrera', sets: [{ distance: '100m', duration: 11.8 }, { distance: '100m', duration: 11.7 }, { distance: '100m', duration: 11.6 }, { distance: '100m', duration: 11.9 }] },
  // s3 (fuerza, mar 8)
  { id: 'ex-11', sessionId: 's3', date: daysAgo(4), name: 'Sentadilla trasera', category: 'fuerza', sets: [{ reps: 10, weight: 105 }, { reps: 8, weight: 110 }, { reps: 6, weight: 115 }] },
  { id: 'ex-12', sessionId: 's3', date: daysAgo(4), name: 'Peso muerto', category: 'fuerza', sets: [{ reps: 6, weight: 140 }, { reps: 5, weight: 145 }, { reps: 5, weight: 150 }] },
  { id: 'ex-13', sessionId: 's3', date: daysAgo(4), name: 'Prensa de piernas', category: 'fuerza', sets: [{ reps: 12, weight: 160 }, { reps: 12, weight: 170 }, { reps: 10, weight: 180 }] },
  // s1 (velocidad, mar 11)
  { id: 'ex-14', sessionId: 's1', date: daysAgo(1), name: '200m sprint', category: 'carrera', sets: [{ distance: '200m', duration: 24.2 }, { distance: '200m', duration: 24.0 }, { distance: '200m', duration: 23.9 }, { distance: '200m', duration: 24.1 }], notes: '4x200m a ritmo de competencia' },
  { id: 'ex-15', sessionId: 's1', date: daysAgo(1), name: '300m sprint', category: 'carrera', sets: [{ distance: '300m', duration: 36.5 }, { distance: '300m', duration: 36.0 }], notes: '2x300m a ritmo de 400m' },
  // Extras para llegar a 20+
  { id: 'ex-16', sessionId: 's4', date: daysAgo(6), name: '150m sprint', category: 'carrera', sets: [{ distance: '150m', duration: 17.9 }, { distance: '150m', duration: 17.7 }, { distance: '150m', duration: 17.6 }, { distance: '150m', duration: 17.8 }, { distance: '150m', duration: 17.5 }, { distance: '150m', duration: 17.7 }] },
  { id: 'ex-17', sessionId: 's14', date: daysAgo(24), name: 'Peso muerto', category: 'fuerza', sets: [{ reps: 5, weight: 135 }, { reps: 5, weight: 140 }, { reps: 3, weight: 145 }] },
  { id: 'ex-18', sessionId: 's8', date: daysAgo(13), name: 'Peso muerto rumano', category: 'fuerza', sets: [{ reps: 10, weight: 92 }, { reps: 10, weight: 92 }, { reps: 8, weight: 97 }] },
  { id: 'ex-19', sessionId: 's3', date: daysAgo(4), name: 'Power clean', category: 'fuerza', sets: [{ reps: 5, weight: 82 }, { reps: 5, weight: 85 }, { reps: 4, weight: 88 }] },
  { id: 'ex-20', sessionId: 's1', date: daysAgo(1), name: 'Split squat', category: 'fuerza', sets: [{ reps: 8, weight: 70 }, { reps: 8, weight: 70 }, { reps: 6, weight: 75 }], notes: 'Post-track, activación' },
]

// ─── HÁBITOS DE RECUPERACIÓN (últimos 60 días) ───────────────
export const mockHabits: Habit[] = [
  // Kine (semanal)
  { id: 'h-1', date: '2026-01-14', type: 'kine', durationMin: 45, notes: 'Trabajo en cadena posterior y flexibilidad hip' },
  { id: 'h-2', date: '2026-01-21', type: 'kine', durationMin: 50, notes: 'Tensión en isquiotibiales post-largo, liberación' },
  { id: 'h-3', date: '2026-01-28', type: 'kine', durationMin: 45, notes: 'Prevención rodilla izquierda, fortalecimiento VMO' },
  { id: 'h-4', date: '2026-02-04', type: 'kine', durationMin: 55, notes: 'Evaluación de marcha, ajustes en pisada' },
  { id: 'h-5', date: '2026-02-11', type: 'kine', durationMin: 45, notes: 'Mantenimiento general, sin dolores activos' },
  { id: 'h-6', date: '2026-02-18', type: 'kine', durationMin: 50, notes: 'Post-competencia, carga en glúteo derecho' },
  { id: 'h-7', date: '2026-02-25', type: 'kine', durationMin: 45, notes: 'Preparación semana de carga, movilidad' },
  { id: 'h-8', date: '2026-03-04', type: 'kine', durationMin: 55, notes: 'Tensión lumbar leve, trabajo postural' },
  { id: 'h-9', date: '2026-03-11', type: 'kine', durationMin: 45, notes: 'Mantenimiento, todo bien' },
  // Masaje (quincenal)
  { id: 'h-10', date: '2026-01-20', type: 'masaje', durationMin: 60, notes: 'Masaje deportivo profundo tren inferior' },
  { id: 'h-11', date: '2026-02-03', type: 'masaje', durationMin: 60, notes: 'Descarga muscular cuádriceps e isquios' },
  { id: 'h-12', date: '2026-02-17', type: 'masaje', durationMin: 60, notes: 'Relajación muscular total, buena recuperación' },
  { id: 'h-13', date: '2026-03-03', type: 'masaje', durationMin: 60, notes: 'Descarga post-semana intensa, gemelos' },
  // Crioterapia
  { id: 'h-14', date: '2026-01-25', type: 'crioterapia', durationMin: 20, notes: 'Baño de hielo post-competencia, 12°C' },
  { id: 'h-15', date: '2026-02-15', type: 'crioterapia', durationMin: 20, notes: 'Crioterapia post-entrenamiento intenso' },
  { id: 'h-16', date: '2026-03-01', type: 'crioterapia', durationMin: 15, notes: 'Inmersión en hielo después del largo' },
  // Psicología
  { id: 'h-17', date: '2026-01-30', type: 'psicologia', durationMin: 60, notes: 'Trabajo en manejo de presión competitiva' },
  { id: 'h-18', date: '2026-02-27', type: 'psicologia', durationMin: 60, notes: 'Visualización de carrera, rutina mental' },
  // Rutina pre-competencia
  { id: 'h-19', date: '2026-01-24', type: 'rutina_pre_comp', durationMin: 30, notes: 'Activación, visualización y protocolo de calentamiento', preCompetition: true },
  { id: 'h-20', date: '2026-02-14', type: 'rutina_pre_comp', durationMin: 30, notes: 'Rutina completa: drills, strides y mentalización', preCompetition: true },
  { id: 'h-21', date: '2026-02-28', type: 'rutina_pre_comp', durationMin: 30, notes: 'Ajuste de rutina según feedback del entrenador', preCompetition: true },
  // Extra kine + otros
  { id: 'h-22', date: '2026-01-07', type: 'kine', durationMin: 45, notes: 'Primera sesión del año, evaluación inicial' },
  { id: 'h-23', date: '2026-02-10', type: 'crioterapia', durationMin: 20, notes: 'Recuperación post-semana de velocidad' },
  { id: 'h-24', date: '2026-01-13', type: 'kine', durationMin: 50, notes: 'Trabajo en cadera y rotadores' },
  { id: 'h-25', date: '2026-03-08', type: 'masaje', durationMin: 45, notes: 'Masaje de mantenimiento quincenal' },
  { id: 'h-26', date: '2026-02-21', type: 'psicologia', durationMin: 60, notes: 'Gestión de expectativas para período de competencias' },
]
