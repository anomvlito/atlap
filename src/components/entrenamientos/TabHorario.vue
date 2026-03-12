<script setup lang="ts">
import { ref, computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAthleteStore } from '@/stores/athlete'

const store = useAthleteStore()
const weekOffset = ref(0)

const typeColors: Record<string, string> = {
  velocidad: '#5b5ef4',
  fondo: '#10b981',
  tecnica: '#f59e0b',
  fuerza: '#ef4444',
}

const typeLabels: Record<string, string> = {
  velocidad: 'Velocidad',
  fondo: 'Fondo',
  tecnica: 'Técnica',
  fuerza: 'Fuerza',
}

const typeIcons: Record<string, string> = {
  velocidad: 'Zap',
  fondo: 'Wind',
  tecnica: 'Target',
  fuerza: 'Dumbbell',
}

const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// Monday-based week start
const weekStart = computed(() => {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day
  const start = new Date(now)
  start.setDate(now.getDate() + diff + weekOffset.value * 7)
  start.setHours(0, 0, 0, 0)
  return start
})

const weekDays = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.value)
    d.setDate(d.getDate() + i)
    return d
  })
})

const weekLabel = computed(() => {
  const start = weekDays.value[0]!
  const end = weekDays.value[6]!
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  if (weekOffset.value === 0) return 'Esta semana'
  if (weekOffset.value === -1) return 'Semana pasada'
  if (weekOffset.value === 1) return 'Próxima semana'
  return `${start.toLocaleDateString('es-CL', opts)} — ${end.toLocaleDateString('es-CL', opts)}`
})

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]!
}

function sessionsForDay(day: Date) {
  const dateStr = toDateStr(day)
  return store.schedule.filter((s) => s.date === dateStr)
}

const today = computed(() => toDateStr(new Date()))

function isToday(d: Date) {
  return toDateStr(d) === today.value
}

function isPast(d: Date) {
  return toDateStr(d) < today.value
}

function totalPlanned() {
  return weekDays.value.reduce((acc, d) => acc + sessionsForDay(d).length, 0)
}

function totalCompleted() {
  return weekDays.value.reduce((acc, d) => acc + sessionsForDay(d).filter((s) => s.completed).length, 0)
}
</script>

<template>
  <div class="tab-horario">
    <!-- Navegación semana -->
    <div class="week-nav">
      <button class="week-nav__btn" @click="weekOffset--">
        <AppIcon name="ChevronLeft" :size="18" />
      </button>
      <div class="week-nav__center">
        <p class="week-nav__label">{{ weekLabel }}</p>
        <p class="week-nav__progress">{{ totalCompleted() }} / {{ totalPlanned() }} sesiones</p>
      </div>
      <button class="week-nav__btn" @click="weekOffset++">
        <AppIcon name="ChevronRight" :size="18" />
      </button>
    </div>

    <!-- Días de la semana -->
    <div class="week-grid">
      <div
        v-for="(day, idx) in weekDays"
        :key="idx"
        class="day-card"
        :class="{
          'day-card--today': isToday(day),
          'day-card--past': isPast(day) && !isToday(day),
          'day-card--empty': sessionsForDay(day).length === 0,
        }"
      >
        <div class="day-card__header">
          <span class="day-card__name">{{ dayNames[idx] }}</span>
          <span class="day-card__num" :class="{ 'day-card__num--today': isToday(day) }">
            {{ day.getDate() }}
          </span>
        </div>

        <div v-if="sessionsForDay(day).length > 0" class="day-card__sessions">
          <div
            v-for="session in sessionsForDay(day)"
            :key="session.id"
            class="session-chip"
            :class="{ 'session-chip--done': session.completed }"
            :style="{ '--chip-color': typeColors[session.type] }"
          >
            <div class="session-chip__top">
              <AppIcon :name="typeIcons[session.type]!" :size="13" />
              <span class="session-chip__type">{{ typeLabels[session.type] }}</span>
              <AppIcon v-if="session.completed" name="Check" :size="13" class="session-chip__check" />
            </div>
            <div class="session-chip__meta">
              <span v-if="session.plannedDistanceKm > 0">{{ session.plannedDistanceKm }} km</span>
              <span>{{ session.plannedDurationMin }} min</span>
            </div>
            <p v-if="session.notes" class="session-chip__notes">{{ session.notes }}</p>
          </div>
        </div>

        <div v-else class="day-card__empty">
          <span>Descanso</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-horario {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.week-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: var(--card-shadow);
}

.week-nav__btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--color-heading);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}

.week-nav__btn:hover {
  background: rgba(255, 255, 255, 0.06);
}

.week-nav__center {
  flex: 1;
  text-align: center;
}

.week-nav__label {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-heading);
}

.week-nav__progress {
  font-size: 12px;
  color: var(--vt-c-text-dark-2);
  margin-top: 2px;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

@media (max-width: 600px) {
  .week-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 601px) and (max-width: 900px) {
  .week-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.day-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 10px;
  min-height: 100px;
  box-shadow: var(--card-shadow);
  transition: border-color 0.15s;
}

.day-card--today {
  border-color: rgba(91, 94, 244, 0.4);
  background: rgba(91, 94, 244, 0.05);
}

.day-card--past {
  opacity: 0.7;
}

.day-card--empty {
  opacity: 0.5;
}

.day-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.day-card__name {
  font-size: 11px;
  font-weight: 600;
  color: var(--vt-c-text-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.day-card__num {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-heading);
}

.day-card__num--today {
  color: var(--accent-primary);
}

.day-card__sessions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.session-chip {
  border-radius: 8px;
  padding: 6px 8px;
  border: 1px solid color-mix(in srgb, var(--chip-color) 30%, transparent);
  background: color-mix(in srgb, var(--chip-color) 10%, transparent);
  color: var(--chip-color);
}

.session-chip--done {
  opacity: 0.75;
}

.session-chip--done .session-chip__top {
  text-decoration: line-through;
  opacity: 0.7;
}

.session-chip__top {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
}

.session-chip__type {
  flex: 1;
}

.session-chip__check {
  color: var(--color-success);
}

.session-chip__meta {
  display: flex;
  gap: 8px;
  font-size: 10px;
  margin-top: 3px;
  opacity: 0.8;
  font-weight: 600;
}

.session-chip__notes {
  font-size: 10px;
  color: var(--vt-c-text-dark-2);
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.day-card__empty {
  font-size: 11px;
  color: var(--vt-c-text-dark-2);
  text-align: center;
  padding-top: 8px;
}
</style>
