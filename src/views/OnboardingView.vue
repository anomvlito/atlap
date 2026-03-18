<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUser } from '@clerk/vue'
import { useCurrentUser, type ProfileData } from '../composables/useCurrentUser'
import { SPORT_GROUPS, getDisciplinesForGroup, type SportGroup } from '@/types/discipline'
import AppIcon from '@/components/ui/AppIcon.vue'

const emit = defineEmits<{ complete: [] }>()

const { user } = useUser()
const { saveProfile } = useCurrentUser()

const form = ref<ProfileData>({
  fullName:   user.value?.fullName ?? '',
  birthDate:  '',
  height:     null,
  gender:     'masculino',
  discipline: '',
})

const submitting = ref(false)
const error = ref('')

// Discipline selection state
const selectedGroup = ref<SportGroup | null>(null)
const selectedDisciplines = ref<string[]>([])

watch(selectedDisciplines, (val) => {
  form.value.discipline = val.join(',')
})

function selectGroup(group: SportGroup) {
  selectedGroup.value = group
  selectedDisciplines.value = []
}

function toggleDiscipline(id: string) {
  if (selectedDisciplines.value.includes(id)) {
    selectedDisciplines.value = selectedDisciplines.value.filter((d) => d !== id)
  } else {
    selectedDisciplines.value = [...selectedDisciplines.value, id]
  }
}

async function handleSubmit() {
  if (!form.value.fullName.trim()) {
    error.value = 'El nombre es obligatorio'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    await saveProfile(form.value)
    emit('complete')
  } catch (e) {
    error.value = 'Error al guardar el perfil. Intentá de nuevo.'
    console.error(e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="onboarding">
    <div class="onboarding__card">
      <div class="onboarding__header">
        <span class="onboarding__logo">ATLAP</span>
        <h1 class="onboarding__title">Configurá tu perfil</h1>
        <p class="onboarding__subtitle">
          Contanos un poco sobre vos para personalizar tu experiencia
        </p>
      </div>

      <form class="onboarding__form" @submit.prevent="handleSubmit">
        <!-- Nombre completo -->
        <div class="field">
          <label class="field__label" for="fullName">Nombre completo</label>
          <input
            id="fullName"
            v-model="form.fullName"
            type="text"
            class="field__input"
            placeholder="Tu nombre"
            autocomplete="name"
            required
          />
        </div>

        <!-- Fecha de nacimiento -->
        <div class="field">
          <label class="field__label" for="birthDate">Fecha de nacimiento</label>
          <input
            id="birthDate"
            v-model="form.birthDate"
            type="date"
            class="field__input"
          />
        </div>

        <!-- Estatura -->
        <div class="field">
          <label class="field__label" for="height">Estatura (cm)</label>
          <input
            id="height"
            v-model.number="form.height"
            type="number"
            class="field__input"
            placeholder="ej: 175"
            min="100"
            max="250"
          />
        </div>

        <!-- Género -->
        <div class="field">
          <label class="field__label">Género</label>
          <div class="field__radios">
            <label
              v-for="opt in [
                { value: 'masculino', label: 'Masculino' },
                { value: 'femenino',  label: 'Femenino'  },
                { value: 'otro',      label: 'Otro'      },
              ]"
              :key="opt.value"
              class="radio"
              :class="{ 'radio--active': form.gender === opt.value }"
            >
              <input
                v-model="form.gender"
                type="radio"
                :value="opt.value"
                class="radio__input"
              />
              {{ opt.label }}
            </label>
          </div>
        </div>

        <!-- Disciplina deportiva — Paso 1: grupo -->
        <div v-if="!selectedGroup" class="field">
          <label class="field__label">Grupo deportivo</label>
          <div class="sport-groups">
            <button
              v-for="group in SPORT_GROUPS"
              :key="group.id"
              type="button"
              class="sport-group-card"
              @click="selectGroup(group.id)"
            >
              <AppIcon :name="group.icon" :size="28" />
              <div class="sport-group-card__text">
                <p class="sport-group-card__title">{{ group.label }}</p>
                <p class="sport-group-card__desc">{{ group.description }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Disciplina deportiva — Paso 2: disciplinas específicas -->
        <div v-if="selectedGroup" class="field">
          <div class="field__label-row">
            <label class="field__label">Disciplinas</label>
            <button type="button" class="back-btn" @click="selectedGroup = null">
              <AppIcon name="ChevronLeft" :size="14" /> Cambiar grupo
            </button>
          </div>
          <div class="discipline-chips">
            <button
              v-for="disc in getDisciplinesForGroup(selectedGroup)"
              :key="disc.id"
              type="button"
              class="chip"
              :class="{ 'chip--active': selectedDisciplines.includes(disc.id) }"
              @click="toggleDiscipline(disc.id)"
            >
              {{ disc.label }}
            </button>
          </div>
        </div>

        <p v-if="error" class="onboarding__error">{{ error }}</p>

        <button
          type="submit"
          class="onboarding__btn"
          :disabled="submitting"
        >
          {{ submitting ? 'Guardando...' : 'Comenzar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.onboarding {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-soft);
  padding: 1.5rem;
}

.onboarding__card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: var(--card-shadow);
}

.onboarding__header {
  text-align: center;
  margin-bottom: 2rem;
}

.onboarding__logo {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-heading) 0%, var(--accent-primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.1em;
  display: block;
  margin-bottom: 1rem;
}

.onboarding__title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-heading);
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.onboarding__subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
}

.onboarding__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field__label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.field__input {
  background: var(--color-background-soft);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  color: var(--color-heading);
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s, background 0.2s;
  outline: none;
}

.field__input::placeholder {
  color: var(--color-text-muted);
}

.field__input:focus {
  border-color: var(--accent-primary);
  background: rgba(91,94,244,0.04);
}

.field__radios {
  display: flex;
  gap: 0.75rem;
}

.radio {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem 0.75rem;
  background: var(--color-background-soft);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text);
  transition: all 0.2s;
  user-select: none;
}

.radio--active {
  border-color: var(--accent-primary);
  background: rgba(91,94,244,0.08);
  color: var(--accent-primary);
  font-weight: 600;
}

.radio__input {
  display: none;
}

.onboarding__error {
  font-size: 0.85rem;
  color: #f87171;
  margin: 0;
  text-align: center;
}

.onboarding__btn {
  margin-top: 0.5rem;
  padding: 0.8rem;
  background: var(--accent-primary);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  font-family: inherit;
}

.onboarding__btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.onboarding__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Discipline selection */
.sport-groups {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sport-group-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.2s;
  color: var(--color-heading);
  width: 100%;
}

.sport-group-card:hover {
  border-color: var(--accent-primary);
  background: rgba(91, 94, 244, 0.05);
}

.sport-group-card__title {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.2rem;
}

.sport-group-card__desc {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0;
}

.field__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  background: none;
  border: none;
  color: var(--accent-primary);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.discipline-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  padding: 0.45rem 0.9rem;
  background: var(--color-background-soft);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--color-text);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.chip--active {
  background: rgba(91, 94, 244, 0.12);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  font-weight: 600;
}
</style>
