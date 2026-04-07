<script setup lang="ts">
import { ref, computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAthleteStore } from '@/stores/athlete'
import type { HabitType } from '@/data/mock'

const store = useAthleteStore()
type Filter = 'todos' | HabitType
const activeFilter = ref<Filter>('todos')

const filters: { key: Filter; label: string; icon: string }[] = [
  { key: 'todos', label: 'Todos', icon: 'Activity' },
  { key: 'kine', label: 'Kine', icon: 'Scissors' },
  { key: 'masaje', label: 'Masaje', icon: 'Heart' },
  { key: 'crioterapia', label: 'Crioterapia', icon: 'Snowflake' },
  { key: 'psicologia', label: 'Psicología', icon: 'Brain' },
  { key: 'rutina_pre_comp', label: 'Pre-comp', icon: 'Shield' },
  { key: 'sueño_registro', label: 'Sueño', icon: 'Moon' },
]

const habitLabels: Record<HabitType, string> = {
  kine: 'Kinesiología',
  masaje: 'Masaje deportivo',
  crioterapia: 'Crioterapia',
  psicologia: 'Psicología',
  rutina_pre_comp: 'Rutina pre-competencia',
  sueño_registro: 'Registro de sueño',
}

const habitIcons: Record<HabitType, string> = {
  kine: 'Scissors',
  masaje: 'Heart',
  crioterapia: 'Snowflake',
  psicologia: 'Brain',
  rutina_pre_comp: 'Shield',
  sueño_registro: 'Moon',
}

const habitColors: Record<HabitType, string> = {
  kine: '#10b981',
  masaje: '#f59e0b',
  crioterapia: '#38bdf8',
  psicologia: '#a855f7',
  rutina_pre_comp: '#5b5ef4',
  sueño_registro: '#6366f1',
}

const sortedHabits = computed(() => {
  const list = activeFilter.value === 'todos'
    ? store.habits
    : store.habits.filter((h) => h.type === activeFilter.value)
  return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const stats60d = computed(() => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 60)
  const recent = store.habits.filter((h) => new Date(h.date) >= cutoff)
  const result: Partial<Record<HabitType, number>> = {}
  for (const h of recent) {
    result[h.type] = (result[h.type] ?? 0) + 1
  }
  return result
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="tab-habitos">
    <!-- Stats resumen 60 días -->
    <div class="stats-row">
      <div
        v-for="f in filters.slice(1)"
        :key="f.key"
        class="stat-chip"
        :style="{ '--habit-color': habitColors[f.key as HabitType] }"
      >
        <AppIcon :name="f.icon" :size="14" />
        <span class="stat-chip__count">{{ stats60d[f.key as HabitType] ?? 0 }}</span>
        <span class="stat-chip__label">{{ f.label }}</span>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters">
      <button
        v-for="f in filters"
        :key="f.key"
        class="filter-btn"
        :class="{ 'filter-btn--active': activeFilter === f.key }"
        @click="activeFilter = f.key"
      >
        <AppIcon :name="f.icon" :size="13" />
        {{ f.label }}
      </button>
    </div>

    <!-- Frecuencia nota -->
    <p v-if="activeFilter !== 'todos'" class="freq-note">
      <AppIcon name="Activity" :size="14" />
      {{ stats60d[activeFilter as HabitType] ?? 0 }} sesiones de {{ habitLabels[activeFilter as HabitType] }} en los últimos 60 días
    </p>

    <!-- Sin resultados -->
    <div v-if="sortedHabits.length === 0" class="empty-state">
      <AppIcon name="RefreshCw" :size="32" />
      <p>No hay registros para este filtro</p>
    </div>

    <!-- Lista cronológica -->
    <div class="habits-list">
      <div
        v-for="habit in sortedHabits"
        :key="habit.id"
        class="habit-item"
        :style="{ '--habit-color': habitColors[habit.type] }"
      >
        <div class="habit-item__icon">
          <AppIcon :name="habitIcons[habit.type]" :size="18" />
        </div>
        <div class="habit-item__content">
          <div class="habit-item__header">
            <span class="habit-item__type">{{ habitLabels[habit.type] }}</span>
            <span v-if="habit.preCompetition" class="pre-comp-badge">Pre-comp</span>
          </div>
          <p class="habit-item__date">{{ formatDate(habit.date) }}</p>
          <p v-if="habit.notes" class="habit-item__notes">{{ habit.notes }}</p>
        </div>
        <div v-if="habit.durationMin" class="habit-item__duration">
          <AppIcon name="Timer" :size="13" />
          <span>{{ habit.durationMin }} min</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-habitos {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--habit-color) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--habit-color) 25%, transparent);
  color: var(--habit-color);
  white-space: nowrap;
  flex-shrink: 0;
}

.stat-chip__count {
  font-size: 15px;
  font-weight: 700;
}

.stat-chip__label {
  font-size: 11px;
  font-weight: 600;
}

.filters {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--vt-c-text-dark-2);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.filter-btn--active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

.freq-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--accent-primary);
  font-weight: 500;
  padding: 10px 14px;
  background: rgba(91, 94, 244, 0.08);
  border: 1px solid rgba(91, 94, 244, 0.2);
  border-radius: 10px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--vt-c-text-dark-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.habit-item {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-left: 3px solid var(--habit-color);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: var(--card-shadow);
}

.habit-item__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--habit-color) 12%, transparent);
  color: var(--habit-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.habit-item__content {
  flex: 1;
  min-width: 0;
}

.habit-item__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.habit-item__type {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-heading);
}

.pre-comp-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--accent-primary);
  background: rgba(91, 94, 244, 0.15);
  border: 1px solid rgba(91, 94, 244, 0.3);
  padding: 1px 6px;
  border-radius: 8px;
}

.habit-item__date {
  font-size: 12px;
  color: var(--vt-c-text-dark-2);
}

.habit-item__notes {
  font-size: 12px;
  color: var(--vt-c-text-dark-2);
  margin-top: 4px;
  line-height: 1.4;
}

.habit-item__duration {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vt-c-text-dark-2);
  flex-shrink: 0;
  padding-top: 2px;
}
</style>
