import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  mockAthlete,
  mockMarks,
  mockSessions,
  mockTeam,
  mockRivals,
  mockKpis,
  mockNextCompetition,
  type Mark,
  type TrainingSession,
} from '@/data/mock'

export const useAthleteStore = defineStore('athlete', () => {
  const athlete = ref(mockAthlete)
  const marks = ref(mockMarks)
  const sessions = ref(mockSessions)
  const team = ref(mockTeam)
  const rivals = ref(mockRivals)
  const kpis = ref(mockKpis)
  const nextCompetition = ref(mockNextCompetition)
  const selectedDiscipline = ref('400m')

  const disciplines = computed(() => athlete.value.disciplines)

  const marksByDiscipline = computed(() => {
    return marks.value
      .filter((m) => m.discipline === selectedDiscipline.value)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  })

  const personalRecord = computed(() => {
    const disciplineMarks = marksByDiscipline.value
    if (disciplineMarks.length === 0) return null
    return disciplineMarks.reduce((best, m) => (m.resultSeconds < best.resultSeconds ? m : best))
  })

  const recentSessions = computed(() => {
    return sessions.value
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  })

  const recentMarks = computed(() => {
    return marks.value
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  })

  const sessionsByType = computed(() => {
    const counts = { velocidad: 0, fondo: 0, tecnica: 0, fuerza: 0 }
    for (const s of sessions.value) {
      counts[s.type]++
    }
    return counts
  })

  function setDiscipline(discipline: string) {
    selectedDiscipline.value = discipline
  }

  function addSession(session: Omit<TrainingSession, 'id'>) {
    const newSession: TrainingSession = {
      ...session,
      id: `s${Date.now()}`,
    }
    sessions.value = [newSession, ...sessions.value]
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
    disciplines,
    marksByDiscipline,
    personalRecord,
    recentSessions,
    recentMarks,
    sessionsByType,
    setDiscipline,
    addSession,
  }
})
