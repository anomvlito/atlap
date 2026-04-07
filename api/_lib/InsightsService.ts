/**
 * InsightsService — genera insights de refuerzo positivo desde DB real.
 * Reglas simples, sin IA. Nunca peyorativo.
 *
 * Cada insight tiene:
 *   - type: categoría del insight
 *   - text: mensaje en primera persona, positivo
 *   - value: dato clave del insight (para destacar)
 *   - icon: nombre del icono Lucide
 */
import { MarkRepository } from './repositories/MarkRepository.js'
import { SessionRepository } from './repositories/SessionRepository.js'
import { HabitRepository } from './repositories/HabitRepository.js'

export type InsightType =
  | 'floor_performance'   // todas las marcas sobre un umbral
  | 'personal_record'     // PR actual y cuántos años llevó conseguirlo
  | 'improvement_count'   // cuántas veces mejoró marca este año
  | 'podium_rate'         // % de competencias en podio
  | 'training_volume'     // sesiones completadas en los últimos 30 días
  | 'habit_consistency'   // días con hábitos en últimos 60 días
  | 'competition_count'   // total de competencias en la carrera

export interface Insight {
  type: InsightType
  text: string
  value: string
  icon: string
}

export async function generateInsights(athleteId: string): Promise<Insight[]> {
  const [allMarks, sessions, habits] = await Promise.all([
    MarkRepository.findByAthleteId(athleteId, { limit: 500 }),
    SessionRepository.findByAthleteId(athleteId, { limit: 500 }),
    HabitRepository.findByAthleteId(athleteId, { limit: 500 })
  ])

  const insights: Insight[] = []

  // ── Por disciplina ───────────────────────────────────────
  const byDiscipline = new Map<string, typeof allMarks>()
  for (const m of allMarks) {
    const list = byDiscipline.get(m.discipline) ?? []
    list.push(m)
    byDiscipline.set(m.discipline, list)
  }

  for (const [discipline, dMarks] of byDiscipline.entries()) {
    if (dMarks.length < 3) continue

    const values = dMarks.map(m => Number(m.resultValue))
    const isLower = dMarks[0]?.resultUnit === 'seconds'

    // ── Floor performance (tipo Lucas: "todos tus lanzamientos sobre 60m")
    const sorted = [...values].sort((a, b) => isLower ? a - b : b - a)
    const worstResult = sorted[sorted.length - 1]!
    if (worstResult !== undefined) {
      const unit = isLower ? 's' : 'm'
      const formatted = isLower
        ? worstResult.toFixed(2)
        : worstResult.toFixed(2)
      insights.push({
        type: 'floor_performance',
        text: isLower
          ? `En ${discipline}, todos tus ${dMarks.length} registros históricos están bajo los ${formatted}${unit}`
          : `En ${discipline}, todos tus ${dMarks.length} registros históricos están sobre los ${formatted}${unit}`,
        value: `${dMarks.length} marcas`,
        icon: 'TrendingUp'
      })
    }

    // ── Personal record
    const pr = isLower
      ? dMarks.reduce((b, m) => Number(m.resultValue) < Number(b.resultValue) ? m : b)
      : dMarks.reduce((b, m) => Number(m.resultValue) > Number(b.resultValue) ? m : b)

    const firstYear = Math.min(...dMarks.map(m => new Date(m.date).getFullYear()))
    const prYear = new Date(pr.date).getFullYear()
    const yearsToGet = prYear - firstYear

    const prUnit = isLower ? 's' : 'm'
    const prFormatted = Number(pr.resultValue).toFixed(isLower ? 2 : 2)
    insights.push({
      type: 'personal_record',
      text: yearsToGet > 0
        ? `Tu PR en ${discipline} es ${prFormatted}${prUnit}, alcanzado tras ${yearsToGet} año${yearsToGet > 1 ? 's' : ''} de trabajo`
        : `Tu PR en ${discipline} es ${prFormatted}${prUnit}`,
      value: `${prFormatted}${prUnit}`,
      icon: 'Award'
    })

    // ── Mejoras este año
    const thisYear = new Date().getFullYear()
    const thisYearMarks = dMarks.filter(m => new Date(m.date).getFullYear() === thisYear)
    if (thisYearMarks.length >= 2) {
      const sorted = [...thisYearMarks].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      let improvements = 0
      for (let i = 1; i < sorted.length; i++) {
        const prev = Number(sorted[i - 1]!.resultValue)
        const curr = Number(sorted[i]!.resultValue)
        if (isLower ? curr < prev : curr > prev) improvements++
      }
      if (improvements > 0) {
        insights.push({
          type: 'improvement_count',
          text: `En ${discipline} mejoraste tu marca ${improvements} vez${improvements > 1 ? 'es' : ''} este año`,
          value: `${improvements}x`,
          icon: 'Zap'
        })
      }
    }

    // ── Tasa de podio
    const withRanking = allMarks.filter(m => m.discipline === discipline)
    if (withRanking.length >= 5) {
      const podiums = withRanking.filter(m =>
        m.competition !== null
      ).length
      if (podiums > 0) {
        const rate = Math.round((podiums / withRanking.length) * 100)
        if (rate >= 40) {
          insights.push({
            type: 'podium_rate',
            text: `Tenés ${withRanking.length} competencias registradas en ${discipline}`,
            value: `${withRanking.length}`,
            icon: 'Trophy'
          })
        }
      }
    }
  }

  // ── Volumen de entrenamiento (últimos 30 días) ────────────
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const isoThirty = thirtyDaysAgo.toISOString().split('T')[0]!
  const recentSessions = sessions.filter(s => s.date >= isoThirty && s.completed)
  if (recentSessions.length >= 5) {
    insights.push({
      type: 'training_volume',
      text: `Completaste ${recentSessions.length} entrenamientos en los últimos 30 días`,
      value: `${recentSessions.length} sesiones`,
      icon: 'Activity'
    })
  }

  // ── Total de competencias ─────────────────────────────────
  if (allMarks.length >= 10) {
    insights.push({
      type: 'competition_count',
      text: `Tenés ${allMarks.length} competencias registradas a lo largo de tu carrera`,
      value: `${allMarks.length}`,
      icon: 'Flag'
    })
  }

  // ── Consistencia de hábitos (últimos 60 días) ─────────────
  if (habits.length >= 10) {
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    const isoSixty = sixtyDaysAgo.toISOString().split('T')[0]!
    const recentHabits = habits.filter(h => h.date >= isoSixty)
    if (recentHabits.length >= 8) {
      insights.push({
        type: 'habit_consistency',
        text: `Registraste ${recentHabits.length} hábitos de recuperación en los últimos 60 días`,
        value: `${recentHabits.length}`,
        icon: 'Heart'
      })
    }
  }

  return insights
}
