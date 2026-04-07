/**
 * useInsights — genera insights de refuerzo positivo client-side.
 * Opera sobre los datos del Pinia store (mock ahora, real después).
 * Misma lógica que /api/_lib/InsightsService.ts, sin llamadas HTTP.
 * Cuando el store consuma datos reales, esto funciona sin cambios.
 */
import { computed } from 'vue'
import { useAthleteStore } from '@/stores/athlete'
import type { Mark } from '@/data/mock'

export type InsightType =
  | 'floor_performance'
  | 'personal_record'
  | 'improvement_count'
  | 'competition_count'
  | 'training_volume'
  | 'habit_consistency'

export interface Insight {
  type: InsightType
  text: string
  value: string
  icon: string
}

function groupByDiscipline(marks: Mark[]): Map<string, Mark[]> {
  const map = new Map<string, Mark[]>()
  for (const m of marks) {
    const list = map.get(m.discipline) ?? []
    list.push(m)
    map.set(m.discipline, list)
  }
  return map
}

export function useInsights() {
  const store = useAthleteStore()

  const insights = computed<Insight[]>(() => {
    const result: Insight[] = []
    const allMarks = store.marks
    const byDisc = groupByDiscipline(allMarks)

    for (const [discipline, dMarks] of byDisc.entries()) {
      if (dMarks.length < 3) continue
      const isLower = dMarks[0]?.resultUnit === 'seconds'
      const values = dMarks.map(m => m.resultValue)

      // ── Floor performance ──────────────────────────────────
      const worst = isLower ? Math.max(...values) : Math.min(...values)
      const unit  = isLower ? 's' : 'm'
      const fmt   = (v: number) => isLower ? `${v.toFixed(2)}${unit}` : `${v.toFixed(2)}${unit}`
      result.push({
        type: 'floor_performance',
        text: isLower
          ? `En ${discipline}, todos tus ${dMarks.length} registros están bajo los ${fmt(worst)}`
          : `En ${discipline}, todos tus ${dMarks.length} registros están sobre los ${fmt(worst)}`,
        value: `${dMarks.length} marcas`,
        icon: 'TrendingUp'
      })

      // ── Personal record ────────────────────────────────────
      const pr = isLower
        ? dMarks.reduce((b, m) => m.resultValue < b.resultValue ? m : b)
        : dMarks.reduce((b, m) => m.resultValue > b.resultValue ? m : b)
      const firstYear = Math.min(...dMarks.map(m => new Date(m.date).getFullYear()))
      const prYear    = new Date(pr.date).getFullYear()
      const yearsToGet = prYear - firstYear
      result.push({
        type: 'personal_record',
        text: yearsToGet > 0
          ? `Tu PR en ${discipline} es ${fmt(pr.resultValue)}, alcanzado tras ${yearsToGet} año${yearsToGet > 1 ? 's' : ''} de trabajo`
          : `Tu PR en ${discipline} es ${fmt(pr.resultValue)}`,
        value: fmt(pr.resultValue),
        icon: 'Award'
      })

      // ── Mejoras este año ───────────────────────────────────
      const thisYear = new Date().getFullYear()
      const thisYearMarks = dMarks
        .filter(m => new Date(m.date).getFullYear() === thisYear)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      if (thisYearMarks.length >= 2) {
        let improvements = 0
        for (let i = 1; i < thisYearMarks.length; i++) {
          const prev = thisYearMarks[i - 1]!.resultValue
          const curr = thisYearMarks[i]!.resultValue
          if (isLower ? curr < prev : curr > prev) improvements++
        }
        if (improvements > 0) {
          result.push({
            type: 'improvement_count',
            text: `En ${discipline} mejoraste tu marca ${improvements} vez${improvements > 1 ? 'es' : ''} este año`,
            value: `${improvements}x`,
            icon: 'Zap'
          })
        }
      }
    }

    // ── Total de competencias ──────────────────────────────
    if (allMarks.length >= 10) {
      result.push({
        type: 'competition_count',
        text: `Tenés ${allMarks.length} competencias registradas a lo largo de tu carrera`,
        value: `${allMarks.length}`,
        icon: 'Flag'
      })
    }

    // ── Volumen de entrenamiento (últimos 30 días) ─────────
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentSessions = store.sessions.filter(
      s => new Date(s.date) >= thirtyDaysAgo
    )
    if (recentSessions.length >= 4) {
      result.push({
        type: 'training_volume',
        text: `Completaste ${recentSessions.length} entrenamientos en los últimos 30 días`,
        value: `${recentSessions.length} sesiones`,
        icon: 'Activity'
      })
    }

    // ── Hábitos (últimos 60 días) ──────────────────────────
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    const recentHabits = store.habits.filter(
      h => new Date(h.date) >= sixtyDaysAgo
    )
    if (recentHabits.length >= 8) {
      result.push({
        type: 'habit_consistency',
        text: `Registraste ${recentHabits.length} hábitos de recuperación en los últimos 60 días`,
        value: `${recentHabits.length}`,
        icon: 'Heart'
      })
    }

    return result
  })

  return { insights }
}
