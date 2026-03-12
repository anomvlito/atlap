<script setup lang="ts">
defineProps<{
  label: string
  value: string
  subtitle?: string
  color?: 'primary' | 'success' | 'warning' | 'danger'
  icon?: 'medal' | 'clock' | 'calendar' | 'fire'
}>()
</script>

<template>
  <div class="kpi-card" :class="`kpi-card--${color ?? 'primary'}`">
    <div class="kpi-card__icon">
      <svg v-if="icon === 'medal'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
      <svg v-else-if="icon === 'clock'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
      </svg>
      <svg v-else-if="icon === 'calendar'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
      </svg>
      <svg v-else-if="icon === 'fire'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
      </svg>
    </div>
    <div class="kpi-card__content">
      <p class="kpi-card__label">{{ label }}</p>
      <p class="kpi-card__value">{{ value }}</p>
      <p v-if="subtitle" class="kpi-card__subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<style scoped>
.kpi-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: border-color 0.2s, transform 0.2s;
}

.kpi-card:hover {
  transform: translateY(-1px);
}

.kpi-card--primary .kpi-card__icon { color: var(--accent-primary); background: rgba(99, 102, 241, 0.1); }
.kpi-card--success .kpi-card__icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }
.kpi-card--warning .kpi-card__icon { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
.kpi-card--danger .kpi-card__icon { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

.kpi-card--primary { border-left: 3px solid var(--accent-primary); }
.kpi-card--success { border-left: 3px solid #10b981; }
.kpi-card--warning { border-left: 3px solid #f59e0b; }
.kpi-card--danger { border-left: 3px solid #ef4444; }

.kpi-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-card__icon svg {
  width: 22px;
  height: 22px;
}

.kpi-card__label {
  font-size: 11px;
  font-weight: 500;
  color: var(--vt-c-text-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.kpi-card__value {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-heading);
  line-height: 1;
  margin-bottom: 4px;
}

.kpi-card__subtitle {
  font-size: 12px;
  color: var(--vt-c-text-dark-2);
}
</style>
