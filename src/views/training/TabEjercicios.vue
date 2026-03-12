<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

interface Exercise {
  name: string
  focus: string
  sets?: string
  duration?: string
}

interface Category {
  name: string
  exercises: Exercise[]
}

const categories: Category[] = [
  {
    name: 'Fuerza Explosiva',
    exercises: [
      { name: 'Clean & Jerk', sets: '5x3', focus: 'Potencia' },
      { name: 'Sentadilla con salto', sets: '4x6', focus: 'Fibras rápidas' },
      { name: 'Pliometría nivel 3', sets: '3x10', focus: 'Elasticidad' }
    ]
  },
  {
    name: 'Técnica de Carrera',
    exercises: [
      { name: 'A-Skips', duration: '3x30m', focus: 'Elevación de rodilla' },
      { name: 'Cariocas Rápidas', duration: '4x20m', focus: 'Movilidad cadera' },
      { name: 'Salidas Progresivas', duration: '6x50m', focus: 'Transición' }
    ]
  }
]
</script>

<template>
  <div class="exercises-tab">
    <div v-for="cat in categories" :key="cat.name" class="category">
      <h3 class="category__title">{{ cat.name }}</h3>
      
      <div class="exercise-list">
        <div v-for="ex in cat.exercises" :key="ex.name" class="exercise-card">
          <div class="exercise-card__icon">
            <AppIcon name="Dumbbell" :size="20" v-if="cat.name.includes('Fuerza')" />
            <AppIcon name="Zap" :size="20" v-else />
          </div>
          
          <div class="exercise-card__info">
            <h4 class="name">{{ ex.name }}</h4>
            <p class="focus">{{ ex.focus }}</p>
          </div>

          <div class="exercise-card__data">
            <span class="badge">{{ ex.sets || ex.duration }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exercises-tab {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.3s ease-out;
}

.category__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
  padding-left: 4px;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exercise-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
}

.exercise-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
}

.exercise-card__icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vt-c-text-dark-2);
}

.exercise-card__info {
  flex: 1;
}

.name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-heading);
}

.focus {
  font-size: 11px;
  color: var(--vt-c-text-dark-2);
}

.badge {
  background: var(--accent-primary);
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
