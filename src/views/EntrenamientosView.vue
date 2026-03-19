<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

</script>

<template>
  <div class="entrenos">
    <div class="entrenos__header">
      <div>
        <h1 class="page-title">Entrenamientos</h1>
        <p class="page-subtitle">Registro de tus sesiones</p>
      </div>
    </div>

    <div class="empty-state">
      <div class="empty-icon">
        <AppIcon name="Activity" :size="36" />
      </div>
      <p class="empty-title">Sin sesiones registradas</p>
      <p class="empty-sub">Aquí podrás registrar tus entrenamientos, ejercicios y hábitos.</p>
      <button class="btn-add" disabled>
        <AppIcon name="Plus" :size="16" />
        Nueva sesión (próximamente)
      </button>
    </div>
  </div>
</template>

<style scoped>
.entrenos {
  padding: 24px 16px 100px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
@media (min-width: 1024px) {
  .entrenos { padding: 32px 40px 60px; }
}
.page-title { font-size: 24px; font-weight: 800; color: var(--color-heading); }
.page-subtitle { font-size: 14px; color: var(--color-text-muted); margin-top: 2px; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 64px 24px;
  background: var(--glass-bg);
  border: 1px dashed var(--glass-border);
  border-radius: 20px;
}
.empty-icon {
  color: var(--accent-primary);
  opacity: 0.5;
  margin-bottom: 4px;
}
.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-heading);
}
.empty-sub {
  font-size: 14px;
  color: var(--color-text-muted);
  max-width: 320px;
  line-height: 1.6;
}
.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--accent-primary);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: not-allowed;
  font-family: inherit;
  opacity: 0.5;
  margin-top: 8px;
}
</style>
