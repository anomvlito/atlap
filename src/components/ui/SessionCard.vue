<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import type { TrainingSession } from '@/data/mock'

defineProps<{
  session: TrainingSession
}>()

const emit = defineEmits<{
  'click:sensations': [session: TrainingSession]
}>()

const typeLabels: Record<TrainingSession['type'], string> = {
  velocidad: 'Velocidad',
  fondo: 'Fondo',
  tecnica: 'Técnica',
  fuerza: 'Fuerza',
}

const typeColors: Record<TrainingSession['type'], string> = {
  velocidad: '#5b5ef4',
  fondo: '#10b981',
  tecnica: '#f59e0b',
  fuerza: '#ef4444',
}

const typeIcons: Record<TrainingSession['type'], string> = {
  velocidad: 'Zap',
  fondo: 'Wind',
  tecnica: 'Target',
  fuerza: 'Dumbbell',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
}
</script>

<template>
  <div 
    class="session-card" 
    :style="{ '--type-color': typeColors[session.type] }"
    @click="emit('click:sensations', session)"
  >
    <div class="session-card__left">
      <div class="session-card__icon-wrap">
        <AppIcon :name="typeIcons[session.type]" :size="18" />
      </div>
    </div>

    <div class="session-card__content">
      <div class="session-card__header">
        <span
          class="session-card__type"
          :style="{ color: typeColors[session.type], backgroundColor: `${typeColors[session.type]}18` }"
        >
          {{ typeLabels[session.type] }}
        </span>
        <span class="session-card__date text-capitalize">{{ formatDate(session.date) }}</span>
      </div>
      
      <div class="session-card__body">
        <h3 class="session-card__title">{{ typeLabels[session.type] }}</h3>
        <p v-if="session.distanceKm > 0 || session.series" class="session-card__stats">
          <span v-if="session.distanceKm > 0">{{ session.distanceKm }} km</span>
          <span v-if="session.series">{{ session.series }}</span>
          <span>{{ session.durationMin }} min</span>
        </p>
      </div>

      <div class="session-card__footer">
        <div class="session-card__tags">
          <span class="tag tag--feeling">Sentimiento: {{ session.feeling }}/5</span>
          <span v-if="session.sensations" class="tag tag--sensations">
            <AppIcon name="MessageSquare" :size="10" />
            Diario
          </span>
        </div>
        <div class="session-card__action">
          <AppIcon v-if="session.sensations" name="CheckCircle" :size="16" class="status-icon status-icon--done" />
          <AppIcon v-else name="Plus" :size="16" class="status-icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.session-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  gap: 12px;
  padding: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}

.session-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.session-card__left {
  flex-shrink: 0;
}

.session-card__icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--type-color) 15%, transparent);
  color: var(--type-color);
  border: 1px solid color-mix(in srgb, var(--type-color) 30%, transparent);
}

.session-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-card__type {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 4px;
}

.session-card__date {
  font-size: 11px;
  color: var(--vt-c-text-dark-2);
}

.text-capitalize {
  text-transform: capitalize;
}

.session-card__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-heading);
  margin: 4px 0;
}

.session-card__stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--vt-c-text-dark-2);
  margin: 0;
}

.session-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.session-card__tags {
  display: flex;
  gap: 6px;
}

.tag {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag--feeling {
  background: rgba(255, 255, 255, 0.05);
  color: var(--vt-c-text-dark-2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tag--sensations {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.status-icon {
  color: var(--vt-c-text-dark-2);
  opacity: 0.3;
}

.status-icon--done {
  color: #10b981;
  opacity: 1;
}
</style>
