<script setup lang="ts">
import { ref } from 'vue'
import TrainingForm from '@/components/forms/TrainingForm.vue'
import TabSesiones from '@/components/entrenamientos/TabSesiones.vue'
import TabHorario from '@/components/entrenamientos/TabHorario.vue'
import TabEjercicios from '@/components/entrenamientos/TabEjercicios.vue'
import TabHabitos from '@/components/entrenamientos/TabHabitos.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

type TabKey = 'sesiones' | 'horario' | 'ejercicios' | 'habitos'

const activeTab = ref<TabKey>('sesiones')
const showForm = ref(false)

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'sesiones', label: 'Sesiones', icon: 'Activity' },
  { key: 'horario', label: 'Horario', icon: 'Calendar' },
  { key: 'ejercicios', label: 'Ejercicios', icon: 'Dumbbell' },
  { key: 'habitos', label: 'Hábitos', icon: 'RefreshCw' },
]
</script>

<template>
  <div class="entrenamientos">
      <div class="entrenamientos__header">
        <h1 class="page-title">Entrenamientos</h1>
        <p class="page-subtitle">Registro y seguimiento de tu preparación</p>
      </div>

      <!-- Tab bar -->
      <div class="tab-bar">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <AppIcon :name="tab.icon" :size="15" />
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- v-show preserva el estado de los filtros entre tabs -->
      <div v-show="activeTab === 'sesiones'">
        <TabSesiones />
      </div>
      <div v-show="activeTab === 'horario'">
        <TabHorario />
      </div>
      <div v-show="activeTab === 'ejercicios'">
        <TabEjercicios />
      </div>
      <div v-show="activeTab === 'habitos'">
        <TabHabitos />
      </div>

      <!-- FAB solo en sesiones -->
      <button
        v-if="activeTab === 'sesiones'"
        class="fab"
        @click="showForm = true"
        aria-label="Nueva sesión"
      >
        <AppIcon name="Plus" :size="26" />
      </button>

      <TrainingForm v-if="showForm" @close="showForm = false" />
  </div>
</template>

<style scoped>
.entrenamientos {
  padding: 24px 16px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  font-weight: var(--font-weight-display);
  color: var(--color-heading);
}

.page-subtitle {
  font-size: 14px;
  color: var(--vt-c-text-dark-2);
  margin-top: 4px;
}

.tab-bar {
  display: flex;
  gap: 4px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 5px;
  overflow-x: auto;
  scrollbar-width: none;
}

.tab-bar::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--vt-c-text-dark-2);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.tab-btn--active {
  background: var(--accent-primary);
  color: white;
}

.tab-btn:not(.tab-btn--active):hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-heading);
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
  box-shadow: 0 4px 20px var(--accent-glow);
  z-index: 30;
  transition: transform 0.2s, box-shadow 0.2s;
}

.fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 28px rgba(91, 94, 244, 0.5);
}

@media (min-width: 768px) {
  .fab {
    bottom: 32px;
    right: 40px;
  }
}
</style>
