/**
 * Servicio de Espiral Multifactorial
 * Calcula un score 0-100 en 6 ejes por ciclo de entrenamiento.
 *
 * Ejes:
 *  - velocidad   → ratio sesiones velocidad / total sesiones
 *  - fisico      → volumen promedio (durationMin) normalizado
 *  - tecnica     → ratio sesiones técnica + ratio distancia larga
 *  - mental      → promedio de (5 - stress/2) de sensaciones
 *  - recuperacion→ promedio sleep + promedio energy de sensaciones
 *  - contexto    → ratio hábitos completados en el periodo
 */
import { computed } from 'vue';
import { useAthleteStore } from '@/stores/athlete';
import type { TrainingCycle } from '@/data/mock';

export interface MultifactorScore {
  cycleId: string;
  cycleName: string;
  phase: string;
  velocidad: number;
  fisico: number;
  tecnica: number;
  mental: number;
  recuperacion: number;
  contexto: number;
}

function clamp(v: number): number {
  return Math.min(100, Math.max(0, Math.round(v)));
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((s, n) => s + n, 0) / arr.length;
}

function sessionsBetween(store: ReturnType<typeof useAthleteStore>, start: string, end: string) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return store.sessions.filter(session => {
    const t = new Date(session.date).getTime();
    return t >= s && t <= e;
  });
}

function habitsBetween(store: ReturnType<typeof useAthleteStore>, start: string, end: string) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return store.habits.filter(h => {
    const t = new Date(h.date).getTime();
    return t >= s && t <= e;
  });
}

function marksBetween(store: ReturnType<typeof useAthleteStore>, start: string, end: string) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return store.marks.filter(m => {
    const t = new Date(m.date).getTime();
    return t >= s && t <= e;
  });
}

function computeScore(store: ReturnType<typeof useAthleteStore>, cycle: TrainingCycle): MultifactorScore {
  const sessions = sessionsBetween(store, cycle.startDate, cycle.endDate);
  const habits = habitsBetween(store, cycle.startDate, cycle.endDate);
  const marks = marksBetween(store, cycle.startDate, cycle.endDate);

  const total = sessions.length || 1;

  // ── velocidad (0-100): % sesiones de velocidad × 100, cap 100
  const velSessions = sessions.filter(s => s.type === 'velocidad').length;
  const velocidad = clamp((velSessions / total) * 100 * 2); // ×2 para que 50% = 100

  // ── fisico (0-100): duración promedio normalizada (0-180 min → 0-100)
  const durs = sessions.map(s => s.durationMin ?? 0).filter(d => d > 0);
  const avgDur = avg(durs);
  const fisico = clamp((avgDur / 100) * 55); // 100 min promedio ≈ 55 → escala razonable

  // ── tecnica (0-100): % sesiones técnica + sesiones fondo (resistencia larga)
  const tecSessions = sessions.filter(s => s.type === 'tecnica').length;
  const fondoSessions = sessions.filter(s => s.type === 'fondo').length;
  const tecnica = clamp(((tecSessions + fondoSessions) / total) * 100 * 1.5);

  // ── mental (0-100): 100 - promedio_stress × 20, si hay sensaciones
  const stresses = sessions
    .map(s => s.sensations?.stress)
    .filter((v): v is NonNullable<typeof v> => v !== undefined)
    .map(v => v as number);
  const mental = stresses.length ? clamp(100 - avg(stresses) * 15) : clamp(50 + (marks.length > 0 ? marks.filter(m => m.ranking !== null && m.ranking! <= 3).length * 8 : 0));

  // ── recuperacion (0-100): promedio sleep + energy de sensaciones
  const sleeps = sessions
    .map(s => s.sensations?.sleep)
    .filter((v): v is NonNullable<typeof v> => v !== undefined)
    .map(v => v as number);
  const energies = sessions
    .map(s => s.sensations?.energy)
    .filter((v): v is NonNullable<typeof v> => v !== undefined)
    .map(v => v as number);
  const recuperacion = sleeps.length || energies.length ? clamp(((avg(sleeps) + avg(energies)) / 2) * 20) : 50;

  // ── contexto (0-100): % días con algún hábito en el periodo
  const cycleStart = new Date(cycle.startDate).getTime();
  const cycleEnd = new Date(cycle.endDate).getTime();
  const cycleDays = Math.ceil((cycleEnd - cycleStart) / (1000 * 60 * 60 * 24)) || 1;
  const uniqueDays = new Set(habits.map(h => h.date)).size;
  const contexto = clamp((uniqueDays / Math.min(cycleDays, 60)) * 100 * 1.5);

  return {
    cycleId: cycle.id,
    cycleName: cycle.name,
    phase: cycle.phase,
    velocidad,
    fisico,
    tecnica,
    mental,
    recuperacion,
    contexto
  };
}

export function useMultifactor() {
  const store = useAthleteStore();

  const scores = computed<MultifactorScore[]>(() =>
    store.trainingCycles
      .slice()
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map(cycle => computeScore(store, cycle))
  );

  // Los dos últimos ciclos para comparar en el radar
  const lastTwo = computed<[MultifactorScore | null, MultifactorScore | null]>(() => {
    const s = scores.value;
    return [s[s.length - 2] ?? null, s[s.length - 1] ?? null];
  });

  // Narrativa automática del ciclo actual vs anterior
  const narrative = computed<string[]>(() => {
    const [prev, curr] = lastTwo.value;
    if (!curr) return [];
    if (!prev) return [`Ciclo ${curr.cycleName} en progreso.`];

    const axes: Array<{ key: keyof MultifactorScore; label: string }> = [
      { key: 'velocidad', label: 'velocidad' },
      { key: 'fisico', label: 'físico' },
      { key: 'tecnica', label: 'técnica' },
      { key: 'mental', label: 'fortaleza mental' },
      { key: 'recuperacion', label: 'recuperación' },
      { key: 'contexto', label: 'contexto de vida' }
    ];

    const ups: string[] = [];
    const downs: string[] = [];

    for (const { key, label } of axes) {
      const delta = (curr[key] as number) - (prev[key] as number);
      if (delta >= 8) ups.push(label);
      if (delta <= -8) downs.push(label);
    }

    const lines: string[] = [];
    if (ups.length) lines.push(`Subiste notablemente en ${ups.join(', ')}.`);
    if (downs.length) lines.push(`Bajaste en ${downs.join(', ')}, normal en un ciclo de transición.`);
    if (!ups.length && !downs.length) lines.push('Progreso equilibrado entre ciclos.');

    return lines;
  });

  return { scores, lastTwo, narrative };
}
