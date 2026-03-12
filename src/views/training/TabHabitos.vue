<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

const habits = [
  { name: 'Hidratación (3L)', status: 'completado', icon: 'Droplets' },
  { name: 'Proteína (150g)', status: 'pendiente', icon: 'Utensils' },
  { name: 'Sueño (8h+)', status: 'completado', icon: 'Moon' },
  { name: 'Estiramientos', status: 'en-progreso', icon: 'Activity' },
  { name: 'Suplementos', status: 'completado', icon: 'Zap' }
]
</script>

<template>
  <div class="habits-tab">
    <div class="habit-grid">
      <div v-for="habit in habits" :key="habit.name" class="habit-card" :class="habit.status">
        <div class="habit-card__main">
          <div class="icon-box">
            <AppIcon :name="habit.icon" :size="20" />
          </div>
          <span class="name">{{ habit.name }}</span>
        </div>
        
        <div class="status-indicator">
          <AppIcon name="CheckCircle" :size="16" v-if="habit.status === 'completado'" class="text-green" />
          <AppIcon name="Circle" :size="16" v-else-if="habit.status === 'pendiente'" />
          <AppIcon name="Clock" :size="16" v-else class="text-blue" />
        </div>
      </div>
    </div>

    <div class="habit-summary">
      <div class="stat">
        <span class="val">3/5</span>
        <span class="label">Completados</span>
      </div>
      <div class="stat">
        <span class="val">60%</span>
        <span class="label">Adherencia</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.habits-tab {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.3s ease-out;
}

.habit-grid {
  display: grid;
  gap: 12px;
}

.habit-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.habit-card__main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-box {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
}

.name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-heading);
}

.text-green { color: #10b981; }
.text-blue { color: #3b82f6; }

.habit-summary {
  display: flex;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
}

.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat:not(:last-child) {
  border-right: 1px solid var(--glass-border);
}

.val {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-heading);
}

.label {
  font-size: 11px;
  color: var(--vt-c-text-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
