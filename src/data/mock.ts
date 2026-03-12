export interface Athlete {
  id: string;
  name: string;
  age: number;
  club: string;
  avatar: string;
  disciplines: string[];
  birthDate: string;
  yearsActive: number;
}

export interface Mark {
  id: string;
  date: string;
  competition: string;
  discipline: string;
  result: string;
  resultSeconds: number; // para 400m/800m en segundos
  ranking: number | null;
  isPR: boolean;
}

export interface TrainingSession {
  id: string;
  date: string;
  type: 'velocidad' | 'fondo' | 'tecnica' | 'fuerza';
  distanceKm: number;
  series?: string;
  feeling: 1 | 2 | 3 | 4 | 5;
  notes: string;
  durationMin: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'entrenador' | 'kinesiologo' | 'nutricionista' | 'psicologo';
  avatar: string;
  lastActivity: string;
  notes: string;
}

export interface Rival {
  id: string;
  name: string;
  club: string;
  marks: { date: string; discipline: string; resultSeconds: number }[];
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
  yearsActive: 6
};

// ─── HISTORIAL DE MARCAS ─────────────────────────────────────
export const mockMarks: Mark[] = [
  // 400m
  { id: 'm1', date: '2022-03-12', competition: 'Campeonato Regional', discipline: '400m', result: '49.8s', resultSeconds: 49.8, ranking: 3, isPR: false },
  { id: 'm2', date: '2022-06-18', competition: 'Copa Ciudad', discipline: '400m', result: '49.2s', resultSeconds: 49.2, ranking: 2, isPR: false },
  { id: 'm3', date: '2022-10-08', competition: 'Nacional Sub-23', discipline: '400m', result: '48.7s', resultSeconds: 48.7, ranking: 4, isPR: true },
  { id: 'm4', date: '2023-03-25', competition: 'Campeonato Regional', discipline: '400m', result: '48.5s', resultSeconds: 48.5, ranking: 2, isPR: true },
  { id: 'm5', date: '2023-07-01', competition: 'Clasificatorio ODESUR', discipline: '400m', result: '48.1s', resultSeconds: 48.1, ranking: 1, isPR: true },
  { id: 'm6', date: '2023-10-14', competition: 'Nacional Absoluto', discipline: '400m', result: '47.9s', resultSeconds: 47.9, ranking: 2, isPR: true },
  { id: 'm7', date: '2024-02-20', competition: 'Open Verano', discipline: '400m', result: '48.2s', resultSeconds: 48.2, ranking: 1, isPR: false },
  { id: 'm8', date: '2024-05-11', competition: 'Gran Prix Santiago', discipline: '400m', result: '47.6s', resultSeconds: 47.6, ranking: 1, isPR: true },
  { id: 'm9', date: '2024-08-03', competition: 'Sudamericano', discipline: '400m', result: '47.3s', resultSeconds: 47.3, ranking: 3, isPR: true },
  { id: 'm10', date: '2024-10-19', competition: 'Nacional Absoluto', discipline: '400m', result: '47.5s', resultSeconds: 47.5, ranking: 2, isPR: false },
  { id: 'm11', date: '2025-03-08', competition: 'Open Verano', discipline: '400m', result: '47.8s', resultSeconds: 47.8, ranking: 1, isPR: false },
  { id: 'm12', date: '2025-06-22', competition: 'Gran Prix Santiago', discipline: '400m', result: '47.1s', resultSeconds: 47.1, ranking: 1, isPR: true },
  // 800m
  { id: 'm13', date: '2022-04-09', competition: 'Copa Ciudad', discipline: '800m', result: '1:56.4', resultSeconds: 116.4, ranking: 2, isPR: false },
  { id: 'm14', date: '2023-04-15', competition: 'Regional', discipline: '800m', result: '1:54.8', resultSeconds: 114.8, ranking: 1, isPR: true },
  { id: 'm15', date: '2024-04-27', competition: 'Nacional', discipline: '800m', result: '1:52.3', resultSeconds: 112.3, ranking: 2, isPR: true },
  { id: 'm16', date: '2025-05-10', competition: 'Gran Prix', discipline: '800m', result: '1:51.9', resultSeconds: 111.9, ranking: 1, isPR: true },
  // 200m
  { id: 'm17', date: '2023-02-18', competition: 'Open Indoor', discipline: '200m', result: '22.1s', resultSeconds: 22.1, ranking: 3, isPR: false },
  { id: 'm18', date: '2024-02-10', competition: 'Open Indoor', discipline: '200m', result: '21.8s', resultSeconds: 21.8, ranking: 2, isPR: true },
  { id: 'm19', date: '2025-02-15', competition: 'Open Indoor', discipline: '200m', result: '21.5s', resultSeconds: 21.5, ranking: 1, isPR: true }
];

// ─── SESIONES DE ENTRENAMIENTO (últimos 30 días) ─────────────
const today = new Date();
const daysAgo = (n: number): string => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0] as string;
};

export const mockSessions: TrainingSession[] = [
  { id: 's1', date: daysAgo(1), type: 'velocidad', distanceKm: 8, series: '4x200m + 2x300m', feeling: 4, notes: 'Buena velocidad, piernas ligeras', durationMin: 75 },
  { id: 's2', date: daysAgo(3), type: 'fondo', distanceKm: 14, series: undefined, feeling: 3, notes: 'Ritmo estable, algo de cansancio', durationMin: 80 },
  { id: 's3', date: daysAgo(4), type: 'fuerza', distanceKm: 0, series: '3x10 sentadillas + core', feeling: 5, notes: 'Excelente sesión de gimnasio', durationMin: 60 },
  { id: 's4', date: daysAgo(6), type: 'velocidad', distanceKm: 7, series: '6x150m', feeling: 4, notes: 'Salidas explosivas', durationMin: 70 },
  { id: 's5', date: daysAgo(7), type: 'tecnica', distanceKm: 5, series: 'Drills de carrera', feeling: 4, notes: 'Trabajando frecuencia de paso', durationMin: 55 },
  { id: 's6', date: daysAgo(9), type: 'fondo', distanceKm: 16, series: undefined, feeling: 2, notes: 'Pesado hoy, no di el nivel', durationMin: 90 },
  { id: 's7', date: daysAgo(11), type: 'velocidad', distanceKm: 9, series: '3x300m + 4x100m', feeling: 5, notes: 'Muy buena sesión, marcas de entrenamiento', durationMin: 80 },
  { id: 's8', date: daysAgo(13), type: 'fuerza', distanceKm: 0, series: 'Pesas + pliometría', feeling: 4, notes: 'Buena potencia', durationMin: 65 },
  { id: 's9', date: daysAgo(14), type: 'fondo', distanceKm: 12, series: undefined, feeling: 3, notes: 'Rodaje tranquilo', durationMin: 65 },
  { id: 's10', date: daysAgo(16), type: 'velocidad', distanceKm: 8, series: '5x200m', feeling: 4, notes: 'Mejorando tiempos internos', durationMin: 72 },
  { id: 's11', date: daysAgo(18), type: 'tecnica', distanceKm: 4, series: 'Técnica de curva 400m', feeling: 3, notes: 'Trabajando el paso por curva', durationMin: 50 },
  { id: 's12', date: daysAgo(20), type: 'fondo', distanceKm: 18, series: undefined, feeling: 4, notes: 'Largo del fin de semana, bien', durationMin: 100 },
  { id: 's13', date: daysAgo(22), type: 'velocidad', distanceKm: 7, series: '8x100m', feeling: 5, notes: 'Explosividad máxima', durationMin: 60 },
  { id: 's14', date: daysAgo(24), type: 'fuerza', distanceKm: 0, series: 'Trabajo de tren inferior', feeling: 4, notes: 'Piernas fuertes', durationMin: 70 },
  { id: 's15', date: daysAgo(27), type: 'fondo', distanceKm: 13, series: undefined, feeling: 3, notes: 'Ritmo aeróbico base', durationMin: 72 }
];

// ─── EQUIPO ──────────────────────────────────────────────────
export const mockTeam: TeamMember[] = [
  {
    id: 't1',
    name: 'Carlos Mendoza',
    role: 'entrenador',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosMendoza',
    lastActivity: daysAgo(1),
    notes: 'Análisis de la última competencia enviado. Revisar técnica de salida.'
  },
  {
    id: 't2',
    name: 'Ana Rodríguez',
    role: 'kinesiologo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnaRodriguez',
    lastActivity: daysAgo(3),
    notes: 'Protocolo de recuperación post-competencia actualizado. OK para entrenar.'
  },
  {
    id: 't3',
    name: 'Miguel Fuentes',
    role: 'nutricionista',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MiguelFuentes',
    lastActivity: daysAgo(5),
    notes: 'Plan de hidratación para período de carga. Aumentar carbohidratos.'
  }
];

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
      { date: '2025-06-22', discipline: '400m', resultSeconds: 46.7 }
    ]
  },
  {
    id: 'r2',
    name: 'Diego Torres',
    club: 'Club Providencia',
    marks: [
      { date: '2022-10-08', discipline: '400m', resultSeconds: 49.1 },
      { date: '2023-07-01', discipline: '400m', resultSeconds: 48.6 },
      { date: '2024-08-03', discipline: '400m', resultSeconds: 48.0 },
      { date: '2025-06-22', discipline: '400m', resultSeconds: 47.4 }
    ]
  }
];

// ─── PRÓXIMA COMPETENCIA ─────────────────────────────────────
export const mockNextCompetition = {
  name: 'Gran Prix Nacional 2025',
  date: '2025-08-15',
  location: 'Estadio Nacional, Santiago',
  discipline: '400m'
};

// ─── KPIs DASHBOARD ─────────────────────────────────────────
export const mockKpis = {
  bestMark: { discipline: '400m', result: '47.1s', date: '2025-06-22' },
  lastSession: { daysAgo: 1, type: 'velocidad' as const },
  nextCompetition: mockNextCompetition,
  streak: 4 // semanas consecutivas entrenando
};
