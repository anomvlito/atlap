/**
 * Carga los datos del atleta autenticado desde la API y los escribe en el store.
 * Llamar después de que el usuario esté autenticado y haya completado el onboarding.
 */
import { ref } from 'vue';
import { useApiClient } from '@/services/http';
import { useAthleteStore } from '@/stores/athlete';
import { formatResult } from '@/types/discipline';
import type { Mark, TrainingSession, Habit, TrainingCycle } from '@/data/mock';

// ─── Shapes de respuesta de la API (coinciden con el schema Drizzle serializado) ─

interface ApiSession {
  id: string;
  athleteId: string;
  cycleId: string | null;
  date: string;
  type: 'velocidad' | 'fondo' | 'tecnica' | 'fuerza' | 'mixto';
  plannedDistanceKm: string | null;
  plannedDurationMin: number | null;
  actualDurationMin: number | null;
  notes: string | null;
  completed: boolean;
}

interface ApiMark {
  id: string;
  athleteId: string;
  discipline: string;
  resultValue: string;
  resultUnit: 'seconds' | 'meters';
  date: string;
  competition: string | null;
  isPersonalRecord: boolean;
}

interface ApiHabit {
  id: string;
  date: string;
  type: 'kine' | 'masaje' | 'crioterapia' | 'psicologia' | 'rutina_pre_comp' | 'sueño_registro';
  durationMin: number | null;
  notes: string | null;
  preCompetition: boolean;
}

interface ApiCycle {
  id: string;
  athleteId: string;
  coachId: string | null;
  name: string;
  startDate: string;
  endDate: string;
  phase: 'fuerza' | 'potencia' | 'competencia' | 'descanso' | 'vacaciones';
  notes: string | null;
}

// ─── Mappers DB → Frontend ────────────────────────────────────

function mapSession(s: ApiSession): TrainingSession {
  return {
    id: s.id,
    date: s.date,
    type: s.type === 'mixto' ? 'fuerza' : s.type,
    distanceKm: s.plannedDistanceKm ? parseFloat(s.plannedDistanceKm) : 0,
    feeling: 3,
    notes: s.notes ?? '',
    durationMin: s.actualDurationMin ?? s.plannedDurationMin ?? 0,
  };
}

function mapMark(m: ApiMark): Mark {
  const val = parseFloat(m.resultValue);
  return {
    id: m.id,
    date: m.date,
    competition: m.competition ?? '',
    discipline: m.discipline,
    result: formatResult(val, m.resultUnit),
    resultValue: val,
    resultUnit: m.resultUnit,
    ranking: null,
    isPR: m.isPersonalRecord,
  };
}

function mapHabit(h: ApiHabit): Habit {
  return {
    id: h.id,
    date: h.date,
    type: h.type,
    durationMin: h.durationMin ?? undefined,
    notes: h.notes ?? undefined,
    preCompetition: h.preCompetition,
  };
}

function mapCycle(c: ApiCycle): TrainingCycle {
  return {
    id: c.id,
    athleteId: c.athleteId,
    coachId: c.coachId ?? undefined,
    name: c.name,
    startDate: c.startDate,
    endDate: c.endDate,
    phase: c.phase,
    notes: c.notes ?? undefined,
  };
}

// ─── Composable ───────────────────────────────────────────────

export function useAthleteLoader() {
  const api = useApiClient();
  const store = useAthleteStore();
  const isLoading = ref(false);

  async function loadData() {
    if (isLoading.value) return;
    isLoading.value = true;
    store.isLoading = true;
    try {
      const [sessionsRes, marksRes, habitsRes, cyclesRes] = await Promise.all([
        api.get<ApiSession[]>('/api/sessions'),
        api.get<ApiMark[]>('/api/marks'),
        api.get<ApiHabit[]>('/api/habits'),
        api.get<ApiCycle[]>('/api/cycles'),
      ]);

      if (sessionsRes.data) store.setSessions(sessionsRes.data.map(mapSession));
      if (marksRes.data) store.setMarks(marksRes.data.map(mapMark));
      if (habitsRes.data) store.setHabits(habitsRes.data.map(mapHabit));
      if (cyclesRes.data) store.setCycles(cyclesRes.data.map(mapCycle));
    } catch (err) {
      console.error('[AthleteLoader] Error cargando datos:', err);
    } finally {
      isLoading.value = false;
      store.isLoading = false;
    }
  }

  return { loadData, isLoading };
}
