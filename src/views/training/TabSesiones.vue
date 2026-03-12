<script setup lang="ts">
import { ref } from 'vue'
import SessionCard from '@/components/ui/SessionCard.vue'
import SensationsForm from '@/components/forms/SensationsForm.vue'
import { useAthleteStore } from '@/stores/athlete'
import type { TrainingSession, TrainingSensations } from '@/data/mock'

const athleteStore = useAthleteStore()
const selectedSession = ref<TrainingSession | null>(null)

function openSensations(session: TrainingSession) {
  selectedSession.value = session
}

function handleSaveSensations(sensations: TrainingSensations) {
  if (selectedSession.value) {
    athleteStore.updateSessionSensations(selectedSession.value.id, sensations)
    selectedSession.value = null
  }
}
</script>

<template>
  <div class="sessions-tab">
    <div v-for="session in athleteStore.sessions" :key="session.id" class="session-item">
      <SessionCard :session="session" @click:sensations="openSensations" />
    </div>

    <!-- Modal de sensaciones -->
    <SensationsForm
      v-if="selectedSession"
      :session="selectedSession"
      @save="handleSaveSensations"
      @close="selectedSession = null"
    />
  </div>
</template>

<style scoped>
.sessions-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.3s ease-out;
}

.session-item {
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
