<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { TrainingSession, TrainingSensations } from '@/data/mock'

const props = defineProps<{
  session: TrainingSession
}>()

const emit = defineEmits<{
  save: [sensations: TrainingSensations]
  close: []
}>()

const pre = ref(props.session.sensations?.pre ?? '')
const post = ref(props.session.sensations?.post ?? '')
const energy = ref<1 | 2 | 3 | 4 | 5>((props.session.sensations?.energy as 1 | 2 | 3 | 4 | 5) ?? 3)
const stress = ref<1 | 2 | 3 | 4 | 5>((props.session.sensations?.stress as 1 | 2 | 3 | 4 | 5) ?? 3)
const sleep = ref<1 | 2 | 3 | 4 | 5>((props.session.sensations?.sleep as 1 | 2 | 3 | 4 | 5) ?? 3)

const levelLabels: Record<number, string> = {
  1: 'Muy bajo',
  2: 'Bajo',
  3: 'Medio',
  4: 'Alto',
  5: 'Muy alto',
}

const sleepLabels: Record<number, string> = {
  1: 'Muy malo',
  2: 'Malo',
  3: 'Regular',
  4: 'Bueno',
  5: 'Excelente',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
}

function handleSave() {
  emit('save', {
    pre: pre.value,
    post: post.value,
    energy: energy.value,
    stress: stress.value,
    sleep: sleep.value,
  })
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <!-- Header -->
      <div class="modal__header">
        <div>
          <h2 class="modal__title">Diario de sensaciones</h2>
          <p class="modal__subtitle">{{ formatDate(session.date) }}</p>
        </div>
        <button class="modal__close" @click="emit('close')">
          <AppIcon name="ChevronDown" :size="20" />
        </button>
      </div>

      <div class="modal__body">
        <!-- Métricas -->
        <div class="metrics-section">
          <h3 class="metrics-title">Estado previo al entreno</h3>

          <div class="metric-row">
            <div class="metric-row__label">
              <AppIcon name="Zap" :size="16" />
              <span>Energía</span>
            </div>
            <div class="metric-row__scale">
              <button
                v-for="i in 5"
                :key="i"
                class="scale-btn"
                :class="{ 'scale-btn--active scale-btn--energy': i <= energy }"
                @click="energy = i as 1|2|3|4|5"
              >
                {{ i }}
              </button>
            </div>
            <span class="metric-row__value">{{ levelLabels[energy] }}</span>
          </div>

          <div class="metric-row">
            <div class="metric-row__label">
              <AppIcon name="Activity" :size="16" />
              <span>Estrés</span>
            </div>
            <div class="metric-row__scale">
              <button
                v-for="i in 5"
                :key="i"
                class="scale-btn"
                :class="{ 'scale-btn--active scale-btn--stress': i <= stress }"
                @click="stress = i as 1|2|3|4|5"
              >
                {{ i }}
              </button>
            </div>
            <span class="metric-row__value">{{ levelLabels[stress] }}</span>
          </div>

          <div class="metric-row">
            <div class="metric-row__label">
              <AppIcon name="Clock" :size="16" />
              <span>Sueño</span>
            </div>
            <div class="metric-row__scale">
              <button
                v-for="i in 5"
                :key="i"
                class="scale-btn"
                :class="{ 'scale-btn--active scale-btn--sleep': i <= sleep }"
                @click="sleep = i as 1|2|3|4|5"
              >
                {{ i }}
              </button>
            </div>
            <span class="metric-row__value">{{ sleepLabels[sleep] }}</span>
          </div>
        </div>

        <!-- Notas Pre -->
        <div class="input-group">
          <label class="input-label">¿Cómo te sientes antes de empezar?</label>
          <textarea
            v-model="pre"
            class="input-textarea"
            placeholder="Ej: Piernas algo cargadas, pero con ganas..."
          ></textarea>
        </div>

        <!-- Notas Post -->
        <div class="input-group">
          <label class="input-label">¿Cómo fue la sesión?</label>
          <textarea
            v-model="post"
            class="input-textarea"
            placeholder="Ej: Logré mantener el ritmo en todas las series..."
          ></textarea>
        </div>
      </div>

      <div class="modal__footer">
        <button class="btn btn--secondary" @click="emit('close')">Cancelar</button>
        <button class="btn btn--primary" @click="handleSave">Guardar cambios</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

@media (min-width: 768px) {
  .overlay {
    align-items: center;
    padding: 20px;
  }
}

.modal {
  width: 100%;
  max-width: 500px;
  background: var(--color-background-soft);
  border-top: 1px solid var(--glass-border);
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

@media (min-width: 768px) {
  .modal {
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    box-shadow: 0 0 100px rgba(0, 0, 0, 0.5);
  }
}

.modal__header {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--glass-border);
}

.modal__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-heading);
}

.modal__subtitle {
  font-size: 13px;
  color: var(--vt-c-text-dark-2);
  text-transform: capitalize;
}

.modal__close {
  background: var(--glass-bg);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--vt-c-text-dark-2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.modal__body {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.metrics-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 16px;
}

.metrics-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.metric-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.metric-row:last-child {
  margin-bottom: 0;
}

.metric-row__label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vt-c-text-dark-2);
  width: 90px;
}

.metric-row__scale {
  flex: 1;
  display: flex;
  gap: 4px;
}

.scale-btn {
  flex: 1;
  height: 28px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.scale-btn--active {
  color: white;
}

.scale-btn--energy.scale-btn--active { background: #f59e0b; border-color: #f59e0b; }
.scale-btn--stress.scale-btn--active { background: #5b5ef4; border-color: #5b5ef4; }
.scale-btn--sleep.scale-btn--active { background: #10b981; border-color: #10b981; }

.metric-row__value {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-heading);
  width: 70px;
  text-align: right;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--vt-c-text-dark-2);
}

.input-textarea {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px;
  color: white;
  font-size: 14px;
  min-height: 80px;
  resize: none;
}

.input-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.modal__footer {
  padding: 24px;
  display: flex;
  gap: 12px;
  border-top: 1px solid var(--glass-border);
}

.btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn--primary {
  background: var(--accent-primary);
  border: none;
  color: white;
}

.btn--primary:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 20px var(--accent-glow);
}

.btn--secondary {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--color-heading);
}

.btn--secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>
