<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const schedule = [
  { day: 'Lunes', morning: 'Técnica + Pesas', afternoon: 'Trote Regenerativo', intensity: 'Alta' },
  { day: 'Martes', morning: 'Series de 200m/400m', afternoon: 'Descanso', intensity: 'Muy Alta' },
  { day: 'Miércoles', morning: 'Pesas (Tren inferior)', afternoon: 'Movilidad ART', intensity: 'Media' },
  { day: 'Jueves', morning: 'Salidas de tacos', afternoon: 'Trote libre', intensity: 'Alta' },
  { day: 'Viernes', morning: 'Resistencia específica', afternoon: 'Descanso', intensity: 'Alta' },
  { day: 'Sábado', morning: 'Control de marcas', afternoon: 'Fisioterapia', intensity: 'Máxima' },
  { day: 'Domingo', morning: 'Descanso activo', afternoon: 'Planificación', intensity: 'Baja' }
]
</script>

<template>
  <div class="schedule-tab">
    <div class="schedule-grid">
      <div v-for="item in schedule" :key="item.day" class="schedule-card" :class="`intensity-${item.intensity.toLowerCase().replace(' ', '-')}`">
        <div class="schedule-card__day">{{ item.day }}</div>
        
        <div class="schedule-card__content">
          <div class="schedule-row">
            <AppIcon name="Sun" :size="14" />
            <span>{{ item.morning }}</span>
          </div>
          <div class="schedule-row">
            <AppIcon name="Moon" :size="14" />
            <span>{{ item.afternoon }}</span>
          </div>
        </div>

        <div class="schedule-card__intensity">
          <span class="label">Intensidad</span>
          <span class="value">{{ item.intensity }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-tab {
  animation: fadeIn 0.3s ease-out;
}

.schedule-grid {
  display: grid;
  gap: 12px;
}

@media (min-width: 768px) {
  .schedule-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.schedule-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.schedule-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.intensity-baja::before { background: #10b981; }
.intensity-media::before { background: #3b82f6; }
.intensity-alta::before { background: #f59e0b; }
.intensity-muy-alta::before { background: #ef4444; }
.intensity-maxima::before { background: #8b5cf6; }

.schedule-card__day {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-heading);
}

.schedule-card__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.schedule-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--vt-c-text-dark-2);
}

.schedule-card__intensity {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.label {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--vt-c-text-dark-2);
  letter-spacing: 0.05em;
}

.value {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-primary);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
