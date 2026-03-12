<script setup lang="ts">
import { ref } from 'vue'
import { useAthleteStore } from '@/stores/athlete'
import type { TrainingSession } from '@/data/mock'

const emit = defineEmits<{
  close: []
}>()

const store = useAthleteStore()

const form = ref({
  type: 'velocidad' as TrainingSession['type'],
  distanceKm: 0,
  series: '',
  feeling: 3 as 1 | 2 | 3 | 4 | 5,
  notes: '',
  durationMin: 60,
  date: new Date().toISOString().split('T')[0] as string,
})

function submit() {
  store.addSession({
    type: form.value.type,
    distanceKm: form.value.distanceKm,
    series: form.value.series || undefined,
    feeling: form.value.feeling,
    notes: form.value.notes,
    durationMin: form.value.durationMin,
    date: form.value.date,
  })
  emit('close')
}

const typeOptions: { value: TrainingSession['type']; label: string; icon: string }[] = [
  { value: 'velocidad', label: 'Velocidad', icon: '⚡' },
  { value: 'fondo', label: 'Fondo', icon: '🏃' },
  { value: 'tecnica', label: 'Técnica', icon: '🎯' },
  { value: 'fuerza', label: 'Fuerza', icon: '💪' },
]
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="training-form">
      <div class="training-form__header">
        <h2>Nueva sesión</h2>
        <button class="training-form__close" @click="emit('close')">✕</button>
      </div>

      <form @submit.prevent="submit" class="training-form__body">
        <!-- Tipo -->
        <div class="form-group">
          <label class="form-label">Tipo de sesión</label>
          <div class="type-selector">
            <button
              v-for="opt in typeOptions"
              :key="opt.value"
              type="button"
              class="type-btn"
              :class="{ 'type-btn--active': form.type === opt.value }"
              @click="form.type = opt.value"
            >
              <span>{{ opt.icon }}</span>
              <span>{{ opt.label }}</span>
            </button>
          </div>
        </div>

        <!-- Fecha y duración -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Fecha</label>
            <input v-model="form.date" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Duración (min)</label>
            <input v-model.number="form.durationMin" type="number" min="5" max="300" class="form-input" />
          </div>
        </div>

        <!-- Distancia y series -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Distancia (km)</label>
            <input v-model.number="form.distanceKm" type="number" min="0" step="0.1" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Series / Trabajo</label>
            <input v-model="form.series" type="text" placeholder="ej. 4x200m" class="form-input" />
          </div>
        </div>

        <!-- Sensaciones -->
        <div class="form-group">
          <label class="form-label">Sensaciones</label>
          <div class="feeling-selector">
            <button
              v-for="i in 5"
              :key="i"
              type="button"
              class="feeling-btn"
              :class="{ 'feeling-btn--active': form.feeling >= i }"
              @click="form.feeling = i as 1 | 2 | 3 | 4 | 5"
            >
              ●
            </button>
            <span class="feeling-label">{{ ['', 'Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente'][form.feeling] }}</span>
          </div>
        </div>

        <!-- Notas -->
        <div class="form-group">
          <label class="form-label">Notas</label>
          <textarea v-model="form.notes" placeholder="¿Cómo fue la sesión?" class="form-textarea" rows="3" />
        </div>

        <!-- Placeholder audio -->
        <div class="audio-placeholder">
          <span>🎙️</span>
          <span>Registro por audio — próximamente</span>
        </div>

        <div class="training-form__actions">
          <button type="button" class="btn-secondary" @click="emit('close')">Cancelar</button>
          <button type="submit" class="btn-primary">Guardar sesión</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
}

@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
  }
}

.training-form {
  background: #111;
  border: 1px solid var(--glass-border);
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .training-form {
    border-radius: 20px;
    max-height: 80vh;
  }
}

.training-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0;
}

.training-form__header h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-heading);
}

.training-form__close {
  background: none;
  border: none;
  color: var(--vt-c-text-dark-2);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.training-form__close:hover {
  background: var(--glass-bg);
}

.training-form__body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vt-c-text-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input,
.form-textarea {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  padding: 10px 12px;
  color: var(--color-heading);
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
  width: 100%;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.form-textarea {
  resize: none;
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--vt-c-text-dark-2);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn span:first-child {
  font-size: 20px;
}

.type-btn--active {
  border-color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent-primary);
}

.feeling-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feeling-btn {
  font-size: 20px;
  color: var(--glass-border);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
  padding: 4px;
}

.feeling-btn--active {
  color: #10b981;
}

.feeling-label {
  font-size: 13px;
  color: var(--vt-c-text-dark-2);
  margin-left: 4px;
}

.audio-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  border: 1px dashed var(--glass-border);
  color: var(--vt-c-text-dark-2);
  font-size: 13px;
  opacity: 0.6;
}

.training-form__actions {
  display: flex;
  gap: 12px;
  padding-top: 4px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover {
  background: #4f51d8;
}

.btn-secondary {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--color-heading);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style>
