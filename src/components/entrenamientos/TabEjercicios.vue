<script setup lang="ts">
import { ref, computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAthleteStore } from '@/stores/athlete'
import type { ExerciseEntry } from '@/data/mock'

const store = useAthleteStore()
type FilterType = 'todos' | 'fuerza' | 'carrera'
const activeFilter = ref<FilterType>('todos')

const filters: { key: FilterType; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'fuerza', label: 'Fuerza' },
  { key: 'carrera', label: 'Carrera' },
]

const filteredByName = computed(() => {
  const result: Record<string, ExerciseEntry[]> = {}
  for (const [name, entries] of Object.entries(store.exercisesByName)) {
    const filtered = activeFilter.value === 'todos'
      ? entries
      : entries.filter((e) => e.category === activeFilter.value)
    if (filtered.length > 0) {
      result[name] = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
  }
  return result
})

function maxWeight(entries: ExerciseEntry[]): number {
  return Math.max(...entries.flatMap((e) => e.sets.map((s) => s.weight ?? 0)))
}

function bestTime(entries: ExerciseEntry[]): number {
  const times = entries.flatMap((e) => e.sets.map((s) => s.duration ?? Infinity))
  return Math.min(...times)
}

function latestMax(entry: ExerciseEntry) {
  if (entry.category === 'fuerza') {
    return Math.max(...entry.sets.map((s) => s.weight ?? 0))
  }
  return Math.min(...entry.sets.map((s) => s.duration ?? Infinity))
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

function progressionTrend(entries: ExerciseEntry[], category: 'fuerza' | 'carrera'): 'up' | 'down' | 'flat' {
  if (entries.length < 2) return 'flat'
  const first = latestMax(entries[0]!)
  const last = latestMax(entries[entries.length - 1]!)
  if (category === 'fuerza') {
    return last > first ? 'up' : last < first ? 'down' : 'flat'
  }
  // carrera: menor tiempo = mejor
  return last < first ? 'up' : last > first ? 'down' : 'flat'
}
</script>

<template>
  <div class="tab-ejercicios">
    <!-- Filtros -->
    <div class="filters">
      <button
        v-for="f in filters"
        :key="f.key"
        class="filter-btn"
        :class="{ 'filter-btn--active': activeFilter === f.key }"
        @click="activeFilter = f.key"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Sin resultados -->
    <div v-if="Object.keys(filteredByName).length === 0" class="empty-state">
      <AppIcon name="Dumbbell" :size="32" />
      <p>No hay ejercicios registrados</p>
    </div>

    <!-- Lista de ejercicios agrupados -->
    <div
      v-for="(entries, name) in filteredByName"
      :key="name"
      class="exercise-group"
    >
      <div class="exercise-group__header">
        <div class="exercise-group__title">
          <AppIcon :name="entries[0]?.category === 'fuerza' ? 'Dumbbell' : 'Zap'" :size="16" />
          <span>{{ name }}</span>
          <span class="exercise-group__count">{{ entries.length }} sesiones</span>
        </div>
        <div class="exercise-group__trend">
          <AppIcon
            :name="progressionTrend(entries, entries[0]!.category) === 'up' ? 'TrendingUp' : progressionTrend(entries, entries[0]!.category) === 'down' ? 'TrendingDown' : 'Minus'"
            :size="16"
            :class="{
              'trend--up': progressionTrend(entries, entries[0]!.category) === 'up',
              'trend--down': progressionTrend(entries, entries[0]!.category) === 'down',
              'trend--flat': progressionTrend(entries, entries[0]!.category) === 'flat',
            }"
          />
          <span
            class="exercise-group__best"
            :class="{
              'trend--up': progressionTrend(entries, entries[0]!.category) === 'up',
              'trend--down': progressionTrend(entries, entries[0]!.category) === 'down',
            }"
          >
            <template v-if="entries[0]?.category === 'fuerza'">
              Máx: {{ maxWeight(entries) }} kg
            </template>
            <template v-else>
              Mejor: {{ bestTime(entries).toFixed(1) }}s
            </template>
          </span>
        </div>
      </div>

      <!-- Progresión de entradas -->
      <div class="exercise-entries">
        <div
          v-for="entry in entries"
          :key="entry.id"
          class="exercise-entry"
        >
          <span class="exercise-entry__date">{{ formatDate(entry.date) }}</span>
          <div class="exercise-entry__sets">
            <template v-if="entry.category === 'fuerza'">
              <span
                v-for="(set, i) in entry.sets"
                :key="i"
                class="set-chip set-chip--strength"
              >
                {{ set.reps }}x{{ set.weight }}kg
              </span>
            </template>
            <template v-else>
              <span
                v-for="(set, i) in entry.sets"
                :key="i"
                class="set-chip set-chip--speed"
              >
                {{ set.distance }} {{ set.duration?.toFixed(1) }}s
              </span>
            </template>
          </div>
          <span class="exercise-entry__peak">
            <template v-if="entry.category === 'fuerza'">
              {{ latestMax(entry) }}kg
            </template>
            <template v-else>
              {{ latestMax(entry).toFixed(1) }}s
            </template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-ejercicios {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filters {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.filter-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--vt-c-text-dark-2);
  font-size: 13px;
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

.exercise-group {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.exercise-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--glass-border);
  gap: 12px;
}

.exercise-group__title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-heading);
  font-size: 14px;
  font-weight: 700;
}

.exercise-group__count {
  font-size: 11px;
  font-weight: 500;
  color: var(--vt-c-text-dark-2);
}

.exercise-group__trend {
  display: flex;
  align-items: center;
  gap: 6px;
}

.exercise-group__best {
  font-size: 13px;
  font-weight: 600;
  color: var(--vt-c-text-dark-2);
}

.trend--up { color: var(--color-success) !important; }
.trend--down { color: var(--color-danger) !important; }
.trend--flat { color: var(--vt-c-text-dark-2) !important; }

.exercise-entries {
  display: flex;
  flex-direction: column;
}

.exercise-entry {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--glass-border);
}

.exercise-entry:last-child {
  border-bottom: none;
}

.exercise-entry__date {
  font-size: 12px;
  color: var(--vt-c-text-dark-2);
  min-width: 56px;
  padding-top: 2px;
  flex-shrink: 0;
}

.exercise-entry__sets {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.set-chip {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;
}

.set-chip--strength {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.set-chip--speed {
  background: rgba(91, 94, 244, 0.1);
  color: var(--accent-primary);
  border: 1px solid rgba(91, 94, 244, 0.2);
}

.exercise-entry__peak {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-heading);
  flex-shrink: 0;
  padding-top: 2px;
}
</style>
