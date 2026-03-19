import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getDisciplineConfig } from '@/types/discipline';
import {
  mockAthlete,
  mockMarks,
  mockSessions,
  mockTeam,
  mockRivals,
  mockKpis,
  mockNextCompetition,
  mockQuotes,
  mockSchedule,
  mockExercises,
  mockHabits,
  mockThrows,
  lucasNerviThrows,
  type TrainingSession,
  type TrainingSensations,
  type MarkSensations,
  type Habit,
  type ExerciseEntry,
  type ScheduledSession,
  type Throw
} from '@/data/mock';

export const useAthleteStore = defineStore('athlete', () => {
  const athlete = ref(mockAthlete);
  const marks = ref(mockMarks);
  const sessions = ref(mockSessions);
  const team = ref(mockTeam);
  const rivals = ref(mockRivals);
  const kpis = ref(mockKpis);
  const nextCompetition = ref(mockNextCompetition);
  const selectedDiscipline = ref('400m');
  const schedule = ref(mockSchedule);
  const exercises = ref(mockExercises);
  const habits = ref(mockHabits);
  const quotes = ref(mockQuotes);
  const throws = ref<Throw[]>(mockThrows);

  // ─── COMPUTEDS ───────────────────────────────────────────────

  const disciplines = computed(() => athlete.value.disciplines);

  const marksByDiscipline = computed(() => marks.value.filter(m => m.discipline === selectedDiscipline.value).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

  const personalRecord = computed(() => {
    const disciplineMarks = marksByDiscipline.value;
    if (disciplineMarks.length === 0) return null;
    const config = getDisciplineConfig(selectedDiscipline.value);
    const betterIs = config?.betterIs ?? 'lower';
    return disciplineMarks.reduce((best, m) => (betterIs === 'lower' ? (m.resultValue < best.resultValue ? m : best) : m.resultValue > best.resultValue ? m : best));
  });

  const recentSessions = computed(() =>
    sessions.value
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  );

  const recentMarks = computed(() =>
    marks.value
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  );

  const sessionsByType = computed(() => {
    const counts = { velocidad: 0, fondo: 0, tecnica: 0, fuerza: 0 };
    for (const s of sessions.value) {
      counts[s.type]++;
    }
    return counts;
  });

  const dailyQuote = computed(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return quotes.value[dayOfYear % quotes.value.length]!;
  });

  const medals = computed(() => {
    const gold = marks.value.filter(m => m.ranking === 1).length;
    const silver = marks.value.filter(m => m.ranking === 2).length;
    const bronze = marks.value.filter(m => m.ranking === 3).length;
    return { gold, silver, bronze, total: gold + silver + bronze };
  });

  const medalsByYear = computed(() => {
    const result: Record<string, { gold: number; silver: number; bronze: number }> = {};
    for (const mark of marks.value) {
      if (mark.ranking !== null && mark.ranking >= 1 && mark.ranking <= 3) {
        const year = mark.date.split('-')[0]!;
        if (!result[year]) result[year] = { gold: 0, silver: 0, bronze: 0 };
        if (mark.ranking === 1) result[year]!.gold++;
        else if (mark.ranking === 2) result[year]!.silver++;
        else if (mark.ranking === 3) result[year]!.bronze++;
      }
    }
    return result;
  });

  const exercisesByName = computed(() => {
    const result: Record<string, ExerciseEntry[]> = {};
    for (const ex of exercises.value) {
      if (!result[ex.name]) result[ex.name] = [];
      result[ex.name]!.push(ex);
    }
    return result;
  });

  const habitsByType = computed(() => {
    const result: Record<string, Habit[]> = {};
    for (const h of habits.value) {
      if (!result[h.type]) result[h.type] = [];
      result[h.type]!.push(h);
    }
    return result;
  });

  // ─── ACTIONS ─────────────────────────────────────────────────

  function setDiscipline(discipline: string) {
    selectedDiscipline.value = discipline;
  }

  function addSession(session: Omit<TrainingSession, 'id'>) {
    const newSession: TrainingSession = { ...session, id: `s${Date.now()}` };
    sessions.value = [newSession, ...sessions.value];
  }

  function updateSessionSensations(id: string, sensations: TrainingSensations) {
    sessions.value = sessions.value.map(s => (s.id === id ? { ...s, sensations } : s));
  }

  function updateMarkSensations(id: string, sensations: MarkSensations) {
    marks.value = marks.value.map(m => (m.id === id ? { ...m, sensations } : m));
  }

  function addThrow(t: Omit<Throw, 'id'>) {
    throws.value = [...throws.value, { ...t, id: `t${Date.now()}` }];
  }

  function importLucasNervi() {
    const existingIds = new Set(throws.value.map(t => t.id));
    const toAdd = lucasNerviThrows.filter(t => !existingIds.has(t.id));
    throws.value = [...throws.value, ...toAdd];
  }

  function addHabit(habit: Omit<Habit, 'id'>) {
    habits.value = [{ ...habit, id: `h${Date.now()}` }, ...habits.value];
  }

  function toggleScheduleCompleted(id: string, sessionId?: string) {
    schedule.value = schedule.value.map(s => (s.id === id ? { ...s, completed: !s.completed, sessionId: sessionId ?? s.sessionId } : s)) as ScheduledSession[];
  }

  return {
    athlete,
    marks,
    sessions,
    team,
    rivals,
    kpis,
    nextCompetition,
    selectedDiscipline,
    schedule,
    exercises,
    habits,
    quotes,
    disciplines,
    marksByDiscipline,
    personalRecord,
    recentSessions,
    recentMarks,
    sessionsByType,
    dailyQuote,
    medals,
    medalsByYear,
    exercisesByName,
    habitsByType,
    throws,
    addThrow,
    importLucasNervi,
    setDiscipline,
    addSession,
    updateSessionSensations,
    updateMarkSensations,
    addHabit,
    toggleScheduleCompleted
  };
});
