<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const weeklyFeeling = ref<1 | 2 | 3 | 4 | 5 | null>(null)
const feelingShared = ref(false)

const FEELINGS = ['😞', '😕', '😐', '😊', '🤩']
const LABELS   = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente']

function shareFeeling(val: 1 | 2 | 3 | 4 | 5) {
  weeklyFeeling.value = val
  feelingShared.value = true
}
</script>

<template>
  <div class="equipo">
    <div class="equipo__header">
      <h1 class="page-title">Mi Equipo</h1>
      <p class="page-subtitle">Colaboración con tu cuerpo técnico</p>
    </div>

    <!-- Estado semanal -->
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
            {{ FEELINGS[i - 1] }}
            <span>{{ LABELS[i - 1] }}</span>
          </button>
        </div>
      </div>
      <div v-else class="feeling-shared">
        <span class="feeling-emoji">{{ FEELINGS[(weeklyFeeling ?? 3) - 1] }}</span>
        <div>
          <p class="feeling-shared__title">Estado registrado</p>
          <p class="feeling-shared__value">{{ LABELS[(weeklyFeeling ?? 3) - 1] }}</p>
        </div>
        <button class="feeling-reset" @click="feelingShared = false">Cambiar</button>
      </div>
    </div>

    <!-- Cuerpo técnico (vacío) -->
    <div class="team-section">
      <h2 class="section-title">Cuerpo técnico</h2>
      <div class="empty-card">
        <AppIcon name="Users" :size="32" class="empty-card__icon" />
        <p class="empty-card__title">Sin integrantes aún</p>
        <p class="empty-card__desc">Próximamente podrás agregar a tu entrenador, kinesiólogo, nutricionista y más.</p>
      </div>
    </div>

    <!-- Feed (vacío) -->
    <div class="feed-section">
      <h2 class="section-title">Feed del equipo</h2>
      <div class="empty-card">
        <AppIcon name="MessageSquare" :size="32" class="empty-card__icon" />
        <p class="empty-card__title">Sin actividad</p>
        <p class="empty-card__desc">Aquí aparecerán los mensajes y notas de tu cuerpo técnico.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.equipo {
  padding: 24px 16px 100px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

@media (min-width: 1024px) {
  .equipo {
    padding: 32px 40px 60px;
    display: grid;
    grid-template-columns: 350px 1fr;
    grid-template-areas:
      "header  header"
      "feeling feeling"
      "members feed";
    gap: 32px;
  }
  .equipo__header { grid-area: header; }
  .weekly-state   { grid-area: feeling; }
  .team-section   { grid-area: members; }
  .feed-section   { grid-area: feed; }
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-heading);
}
.page-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: 4px;
}
.section-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 12px;
}

/* Weekly feeling */
.weekly-state {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--card-shadow);
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
  color: var(--color-text-muted);
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}
.feeling-option span { font-size: 11px; }
.feeling-option:hover {
  background: var(--glass-bg);
  border-color: var(--accent-primary);
}
.feeling-shared {
  display: flex;
  align-items: center;
  gap: 16px;
}
.feeling-emoji { font-size: 40px; }
.feeling-shared__title {
  font-size: 13px;
  color: var(--color-text-muted);
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
  color: var(--color-text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.feeling-reset:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* Empty state */
.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 24px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  text-align: center;
  box-shadow: var(--card-shadow);
}
.empty-card__icon { opacity: 0.3; color: var(--color-text-muted); }
.empty-card__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-heading);
}
.empty-card__desc {
  font-size: 13px;
  color: var(--color-text-muted);
  max-width: 280px;
  line-height: 1.5;
}
</style>
