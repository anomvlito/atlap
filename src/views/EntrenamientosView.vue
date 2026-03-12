<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import TabSesiones from './training/TabSesiones.vue'
import TabHorario from './training/TabHorario.vue'
import TabEjercicios from './training/TabEjercicios.vue'
import TabHabitos from './training/TabHabitos.vue'

type Tab = 'sesiones' | 'horario' | 'ejercicios' | 'habitos'
const activeTab = ref<Tab>('sesiones')

const tabs = [
  { id: 'sesiones', label: 'Sesiones', icon: 'Activity' },
  { id: 'horario', label: 'Horario', icon: 'Calendar' },
  { id: 'ejercicios', label: 'Ejercicios', icon: 'Dumbbell' },
  { id: 'habitos', label: 'Hábitos', icon: 'CheckCircle' }
]
</script>

<template>
  <div class="trainings-view">
    <!-- Header -->
    <header class="header">
      <h1 class="header__title">Mi Entrenamiento</h1>
      <p class="header__subtitle">Planificación y seguimiento de sesiones</p>
    </header>

    <!-- Nav Tabs -->
    <nav class="nav-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="nav-tabs__item"
        :class="{ 'nav-tabs__item--active': activeTab === tab.id }"
        @click="activeTab = tab.id as Tab"
      >
        <AppIcon :name="tab.icon" :size="18" />
        <span>{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Content -->
    <main class="content">
      <keep-alive>
        <component :is="activeTab === 'sesiones' ? TabSesiones : 
                        activeTab === 'horario' ? TabHorario :
                        activeTab === 'ejercicios' ? TabEjercicios : TabHabitos" />
      </keep-alive>
    </main>
  </div>
</template>

<style scoped>
.trainings-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header {
  margin-top: 10px;
}

.header__title {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-heading);
}

.header__subtitle {
  font-size: 14px;
  color: var(--vt-c-text-dark-2);
}

.nav-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}

.nav-tabs::-webkit-scrollbar {
  display: none;
}

.nav-tabs__item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  padding: 10px 16px;
  border-radius: 12px;
  color: var(--vt-c-text-dark-2);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-tabs__item--active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 60, 4, 0.2);
}

.content {
  min-height: 400px;
}
</style>
