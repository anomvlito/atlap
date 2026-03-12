<script setup lang="ts">
import { ref, computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import SessionCard from '@/components/ui/SessionCard.vue'
import TrainingForm from '@/components/forms/TrainingForm.vue'
import { useAthleteStore } from '@/stores/athlete'

const store = useAthleteStore()
const showForm = ref(false)

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
</script>

<template>
  <AppLayout>
    <div class="entrenamientos">
      <div class="entrenamientos__header">
        <h1 class="page-title">Entrenamientos</h1>
        <p class="page-subtitle">Registro y seguimiento de tus sesiones</p>
      </div>

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
          />
        </div>
      </div>

      <!-- FAB -->
      <button class="fab" @click="showForm = true" aria-label="Nueva sesión">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      </button>

      <!-- Modal formulario -->
      <TrainingForm v-if="showForm" @close="showForm = false" />
    </div>
  </AppLayout>
</template>

<style scoped>
.entrenamientos {
  padding: 24px 16px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 100px;
}

@media (min-width: 768px) {
  .entrenamientos {
    padding: 32px 40px;
    padding-bottom: 40px;
  }
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-heading);
}

.page-subtitle {
  font-size: 14px;
  color: var(--vt-c-text-dark-2);
  margin-top: 4px;
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
}

.weekly-stat {
  text-align: center;
}

.weekly-stat__value {
  font-size: 28px;
  font-weight: 800;
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

.fab {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent-primary);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
  z-index: 30;
  transition: transform 0.2s, box-shadow 0.2s;
}

.fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.5);
}

.fab svg {
  width: 28px;
  height: 28px;
}

@media (min-width: 768px) {
  .fab {
    bottom: 32px;
    right: 40px;
  }
}
</style>
