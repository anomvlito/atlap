<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import AthleteCard from '@/components/ui/AthleteCard.vue'
import { useAthleteStore } from '@/stores/athlete'

const store = useAthleteStore()

const weeklyFeeling = ref<1 | 2 | 3 | 4 | 5 | null>(null)
const feelingShared = ref(false)

function shareFeeling(val: 1 | 2 | 3 | 4 | 5) {
  weeklyFeeling.value = val
  feelingShared.value = true
}

const feedMessages = [
  {
    author: 'Carlos Mendoza',
    role: 'Entrenador',
    message: 'Excelente trabajo en la sesión de velocidad de ayer. Los tiempos de 200m están bajando de forma consistente.',
    time: 'Hace 2 horas',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosMendoza',
  },
  {
    author: 'Ana Rodríguez',
    role: 'Kinesióloga',
    message: 'Recuerda hacer el protocolo de recuperación post-sesión. El masaje de rodilla es importante esta semana.',
    time: 'Ayer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnaRodriguez',
  },
  {
    author: 'Miguel Fuentes',
    role: 'Nutricionista',
    message: 'Plan de hidratación actualizado. Aumenta la ingesta de carbohidratos complejos los días de velocidad.',
    time: 'Hace 3 días',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MiguelFuentes',
  },
]
</script>

<template>
  <AppLayout>
    <div class="equipo">
      <div class="equipo__header">
        <h1 class="page-title">Mi Equipo</h1>
        <p class="page-subtitle">Colaboración con tu cuerpo técnico</p>
      </div>

      <!-- Estado semanal del atleta -->
      <div class="weekly-state">
        <h2 class="section-title">Tu estado esta semana</h2>
        <div v-if="!feelingShared" class="feeling-selector">
          <p class="feeling-prompt">¿Cómo te has sentido esta semana?</p>
          <div class="feeling-options">
            <button
              v-for="i in 5"
              :key="i"
              class="feeling-option"
              @click="shareFeeling(i as 1 | 2 | 3 | 4 | 5)"
            >
              {{ ['😞', '😕', '😐', '😊', '🤩'][i - 1] }}
              <span>{{ ['Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente'][i - 1] }}</span>
            </button>
          </div>
        </div>
        <div v-else class="feeling-shared">
          <span class="feeling-emoji">{{ ['😞', '😕', '😐', '😊', '🤩'][(weeklyFeeling ?? 3) - 1] }}</span>
          <div>
            <p class="feeling-shared__title">Estado compartido con tu equipo</p>
            <p class="feeling-shared__value">{{ ['Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente'][(weeklyFeeling ?? 3) - 1] }}</p>
          </div>
          <button class="feeling-reset" @click="feelingShared = false">Cambiar</button>
        </div>
      </div>

      <!-- Integrantes -->
      <div class="team-section">
        <h2 class="section-title">Cuerpo técnico</h2>
        <div class="team-grid">
          <AthleteCard
            v-for="member in store.team"
            :key="member.id"
            :member="member"
          />
        </div>
      </div>

      <!-- Feed compartido -->
      <div class="feed-section">
        <h2 class="section-title">Feed del equipo</h2>
        <div class="feed-list">
          <div v-for="msg in feedMessages" :key="msg.author" class="feed-message">
            <img :src="msg.avatar" :alt="msg.author" class="feed-message__avatar" />
            <div class="feed-message__content">
              <div class="feed-message__header">
                <span class="feed-message__name">{{ msg.author }}</span>
                <span class="feed-message__role">{{ msg.role }}</span>
                <span class="feed-message__time">{{ msg.time }}</span>
              </div>
              <p class="feed-message__text">{{ msg.message }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.equipo {
  padding: 24px 16px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

@media (min-width: 768px) {
  .equipo {
    padding: 32px 40px;
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

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vt-c-text-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 12px;
}

.weekly-state {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 20px;
}

.feeling-prompt {
  font-size: 15px;
  color: var(--color-heading);
  margin-bottom: 16px;
}

.feeling-options {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.feeling-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid var(--glass-border);
  background: none;
  cursor: pointer;
  font-size: 28px;
  color: var(--vt-c-text-dark-2);
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.feeling-option span {
  font-size: 11px;
}

.feeling-option:hover {
  background: var(--glass-bg);
  border-color: var(--accent-primary);
}

.feeling-shared {
  display: flex;
  align-items: center;
  gap: 16px;
}

.feeling-emoji {
  font-size: 40px;
}

.feeling-shared__title {
  font-size: 13px;
  color: var(--vt-c-text-dark-2);
}

.feeling-shared__value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-heading);
}

.feeling-reset {
  margin-left: auto;
  background: none;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 6px 12px;
  color: var(--vt-c-text-dark-2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.feeling-reset:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.team-grid {
  display: grid;
  gap: 12px;
}

@media (min-width: 768px) {
  .team-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feed-message {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  gap: 12px;
}

.feed-message__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.feed-message__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.feed-message__name {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-heading);
}

.feed-message__role {
  font-size: 11px;
  color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.feed-message__time {
  font-size: 11px;
  color: var(--vt-c-text-dark-2);
  margin-left: auto;
}

.feed-message__text {
  font-size: 13px;
  color: var(--vt-c-text-dark-2);
  line-height: 1.6;
}
</style>
