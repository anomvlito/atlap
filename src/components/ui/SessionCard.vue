<script setup lang="ts">
import type { TrainingSession } from '@/data/mock'

defineProps<{
  session: TrainingSession
}>()

const typeLabels: Record<TrainingSession['type'], string> = {
  velocidad: 'Velocidad',
  fondo: 'Fondo',
  tecnica: 'Técnica',
  fuerza: 'Fuerza',
}

const typeColors: Record<TrainingSession['type'], string> = {
  velocidad: '#6366f1',
  fondo: '#10b981',
  tecnica: '#f59e0b',
  fuerza: '#ef4444',
}

const typeIcons: Record<TrainingSession['type'], string> = {
  velocidad: '⚡',
  fondo: '🏃',
  tecnica: '🎯',
  fuerza: '💪',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
}
</script>

<template>
  <div class="session-card">
    <div class="session-card__left">
      <span class="session-card__type-icon">{{ typeIcons[session.type] }}</span>
    </div>
    <div class="session-card__content">
      <div class="session-card__header">
        <span
          class="session-card__type"
          :style="{ color: typeColors[session.type], backgroundColor: `${typeColors[session.type]}15` }"
        >
          {{ typeLabels[session.type] }}
        </span>
        <span class="session-card__date">{{ formatDate(session.date) }}</span>
      </div>
      <div class="session-card__stats">
        <span v-if="session.distanceKm > 0">{{ session.distanceKm }} km</span>
        <span v-if="session.series">{{ session.series }}</span>
        <span>{{ session.durationMin }} min</span>
      </div>
      <p v-if="session.notes" class="session-card__notes">{{ session.notes }}</p>
    </div>
    <div class="session-card__feeling">
      <div class="feeling-dots">
        <span
          v-for="i in 5"
          :key="i"
          class="feeling-dot"
          :class="{ 'feeling-dot--active': i <= session.feeling }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.session-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: border-color 0.2s;
}

.session-card:hover {
  border-color: var(--color-border-hover);
}

.session-card__left {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.session-card__content {
  flex: 1;
  min-width: 0;
}

.session-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.session-card__type {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.session-card__date {
  font-size: 12px;
  color: var(--vt-c-text-dark-2);
}

.session-card__stats {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}

.session-card__stats span {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-heading);
}

.session-card__notes {
  font-size: 12px;
  color: var(--vt-c-text-dark-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-card__feeling {
  flex-shrink: 0;
}

.feeling-dots {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-top: 4px;
}

.feeling-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--glass-border);
}

.feeling-dot--active {
  background: #10b981;
}
</style>
