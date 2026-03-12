<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { Mark, MarkSensations } from '@/data/mock'

const props = defineProps<{
  mark: Mark
}>()

const emit = defineEmits<{
  save: [sensations: MarkSensations]
  close: []
}>()

const pre = ref(props.mark.sensations?.pre ?? '')
const post = ref(props.mark.sensations?.post ?? '')
const feeling = ref<1 | 2 | 3 | 4 | 5>((props.mark.sensations?.feeling as 1 | 2 | 3 | 4 | 5) ?? 3)

const feelingLabels: Record<number, string> = {
  1: 'Frustrado',
  2: 'Incómodo',
  3: 'Neutral',
  4: 'Satisfecho',
  5: 'Eufórico',
}

function handleSave() {
  emit('save', {
    pre: pre.value,
    post: post.value,
    feeling: feeling.value,
  })
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal__header">
        <div>
          <h2 class="modal__title">Detalles de la marca</h2>
          <p class="modal__subtitle">{{ mark.result }} en {{ mark.discipline }} ({{ mark.date }})</p>
        </div>
        <button class="modal__close" @click="emit('close')">
          <AppIcon name="ChevronDown" :size="20" />
        </button>
      </div>

      <div class="modal__body">
        <div class="metrics-section">
          <h3 class="metrics-title">Estado de ánimo</h3>

          <div class="metric-row">
            <div class="metric-row__label">
              <AppIcon name="Activity" :size="16" />
              <span>Sensación</span>
            </div>
            <div class="metric-row__scale">
              <button
                v-for="i in 5"
                :key="i"
                class="scale-btn"
                :class="{ 'scale-btn--active scale-btn--feeling': i <= feeling }"
                @click="feeling = i as 1|2|3|4|5"
              >
                {{ i }}
              </button>
            </div>
            <span class="metric-row__value">{{ feelingLabels[feeling] }}</span>
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">Sensaciones Pre-competencia</label>
          <textarea
            v-model="pre"
            class="input-textarea"
            placeholder="¿Cómo te sentías antes de la carrera? Ej: Nervios, confianza..."
          ></textarea>
        </div>

        <div class="input-group">
          <label class="input-label">Análisis Post-competencia</label>
          <textarea
            v-model="post"
            class="input-textarea"
            placeholder="¿Qué aprendiste? ¿Cómo estuvo el resultado?"
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
  background: var(--vt-c-black-mute);
  border-top: 1px solid var(--glass-border);
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
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
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 70vh;
  overflow-y: auto;
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
  margin-bottom: 16px;
}

.metric-row {
  display: flex;
  align-items: center;
  gap: 12px;
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

.scale-btn--feeling.scale-btn--active { background: #3b82f6; border-color: #3b82f6; }

.metric-row__value {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-heading);
  width: 90px;
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

.btn--secondary {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--color-heading);
}
</style>
