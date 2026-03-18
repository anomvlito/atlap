<script setup lang="ts">
import { ref, computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import MarkSensationsForm from '@/components/forms/MarkSensationsForm.vue'
import { useAthleteStore } from '@/stores/athlete'
import type { Mark, MarkSensations } from '@/data/mock'

const athleteStore = useAthleteStore()
const selectedMark = ref<Mark | null>(null)

const events = computed(() => {
  const allEvents = athleteStore.marks.map(m => m.discipline)
  return [...new Set(allEvents)]
})

const filteredBests = (event: string) => {
  return athleteStore.marks.filter(m => m.discipline === event)
}

function openMarkDetails(mark: Mark) {
  selectedMark.value = mark
}

function handleSaveSensations(sensations: MarkSensations) {
  if (selectedMark.value) {
    athleteStore.updateMarkSensations(selectedMark.value.id, sensations)
    selectedMark.value = null
  }
}
</script>

<template>
  <div class="marks-view">
      <header class="header">
        <h1 class="header__title">Mis Marcas</h1>
        <p class="header__subtitle">Evolución de récords personales</p>
      </header>

      <div class="marks-grid">
        <div v-for="event in events" :key="event" class="event-group">
          <h2 class="event-group__title">{{ event }}</h2>
          
          <div class="mark-list">
            <div 
              v-for="mark in filteredBests(event)" 
              :key="mark.id" 
              class="mark-card"
              @click="openMarkDetails(mark)"
            >
              <div class="mark-card__main">
                <span class="value">{{ mark.result }}</span>
                <span class="date">{{ mark.date }}</span>
              </div>
              
              <div class="mark-card__indicators">
                <span v-if="mark.isPR" class="pr-badge">PR</span>
                <AppIcon v-if="mark.sensations" name="MessageSquare" :size="14" class="text-blue" />
                <AppIcon name="ChevronRight" :size="16" class="text-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de sensaciones -->
      <MarkSensationsForm
        v-if="selectedMark"
        :mark="selectedMark"
        @save="handleSaveSensations"
        @close="selectedMark = null"
      />
  </div>
</template>

<style scoped>
.marks-view {
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

.marks-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.event-group__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-primary);
  margin-bottom: 12px;
  border-bottom: 2px solid var(--accent-primary);
  padding-bottom: 4px;
  display: inline-block;
}

.mark-list {
  display: grid;
  gap: 12px;
}

@media (min-width: 768px) {
  .mark-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .mark-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

.mark-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.mark-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

.mark-card__main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.value {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-heading);
  font-family: 'JetBrains Mono', monospace;
}

.date {
  font-size: 12px;
  color: var(--vt-c-text-dark-2);
}

.mark-card__indicators {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pr-badge {
  background: #f59e0b;
  color: black;
  font-size: 9px;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: 4px;
}

.text-blue { color: #3b82f6; }
.text-muted { color: var(--vt-c-text-dark-2); opacity: 0.5; }
</style>
