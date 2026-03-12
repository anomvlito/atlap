<script setup lang="ts">
import { ref, computed } from 'vue'
import SessionCard from '@/components/ui/SessionCard.vue'
import SensationsForm from '@/components/forms/SensationsForm.vue'
import { useAthleteStore } from '@/stores/athlete'
import type { TrainingSession, TrainingSensations } from '@/data/mock'

const store = useAthleteStore()
const selectedSession = ref<TrainingSession | null>(null)

const sortedSessions = computed(() =>
  [...store.sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
)

const weeklyVolume = computed(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return store.sessions
    .filter((s) => new Date(s.date) >= oneWeekAgo)
    .reduce((acc, s) => acc + s.distanceKm, 0)
    .toFixed(1)
})

const weeklyCount = computed(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return store.sessions.filter((s) => new Date(s.date) >= oneWeekAgo).length
})

const typeLabels = { velocidad: 'Velocidad', fondo: 'Fondo', tecnica: 'Técnica', fuerza: 'Fuerza' }

function handleSaveSensations(sensations: TrainingSensations) {
  if (selectedSession.value) {
    store.updateSessionSensations(selectedSession.value.id, sensations)
    selectedSession.value = null
  }
}
</script>

<template>
  <div class="tab-sesiones">
    <!-- Resumen semanal -->
    <div class="weekly-summary">
      <div class="weekly-stat">
        <p class="weekly-stat__value">{{ weeklyCount }}</p>
        <p class="weekly-stat__label">sesiones esta semana</p>
      </div>
      <div class="weekly-divider" />
      <div class="weekly-stat">
        <p class="weekly-stat__value">{{ weeklyVolume }} km</p>
        <p class="weekly-stat__label">volumen semanal</p>
      </div>
      <div class="weekly-divider" />
      <div class="weekly-stat">
        <p class="weekly-stat__value">{{ store.kpis.streak }}</p>
        <p class="weekly-stat__label">semanas racha</p>
      </div>
    </div>

    <!-- Distribución por tipo -->
    <div class="type-dist">
      <h2 class="section-title">Distribución (últimos 30 días)</h2>
      <div class="type-dist__grid">
        <div
          v-for="(count, type) in store.sessionsByType"
          :key="type"
          class="type-dist__item"
        >
          <div class="type-dist__bar-wrap">
            <div
              class="type-dist__bar"
              :style="{ height: `${(count / store.sessions.length) * 100}%` }"
            />
          </div>
          <p class="type-dist__count">{{ count }}</p>
          <p class="type-dist__name">{{ typeLabels[type as keyof typeof typeLabels] }}</p>
        </div>
      </div>
    </div>

    <!-- Lista de sesiones -->
    <div class="sessions-list">
      <h2 class="section-title">Historial de sesiones</h2>
      <div class="sessions-list__items">
        <SessionCard
          v-for="session in sortedSessions"
          :key="session.id"
          :session="session"
          @click:sensations="selectedSession = session"
        />
      </div>
    </div>
  </div>

  <!-- Modal sensaciones -->
  <SensationsForm
    v-if="selectedSession"
    :session="selectedSession"
    @save="handleSaveSensations"
    @close="selectedSession = null"
  />
</template>

<style scoped>
.tab-sesiones {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.weekly-summary {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 16px;
  box-shadow: var(--card-shadow);
}

.weekly-stat {
  text-align: center;
}

.weekly-stat__value {
  font-size: 28px;
  font-weight: var(--font-weight-display);
  color: var(--accent-primary);
}

.weekly-stat__label {
  font-size: 12px;
  color: var(--vt-c-text-dark-2);
  margin-top: 2px;
}

.weekly-divider {
  width: 1px;
  height: 40px;
  background: var(--glass-border);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vt-c-text-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 12px;
}

.type-dist__grid {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  align-items: end;
  box-shadow: var(--card-shadow);
}

.type-dist__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.type-dist__bar-wrap {
  width: 32px;
  height: 80px;
  background: var(--glass-border);
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.type-dist__bar {
  width: 100%;
  background: var(--accent-primary);
  border-radius: 6px;
  min-height: 4px;
  transition: height 0.6s ease;
}

.type-dist__count {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-heading);
}

.type-dist__name {
  font-size: 11px;
  color: var(--vt-c-text-dark-2);
  text-align: center;
}

.sessions-list__items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
