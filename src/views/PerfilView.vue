<script setup lang="ts">
import { computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import MedalCounter from '@/components/ui/MedalCounter.vue'
import { useAthleteStore } from '@/stores/athlete'

const store = useAthleteStore()

const totalCompetitions = computed(() => store.marks.length)

const prs = computed(() => store.marks.filter((m) => m.isPR).length)

const age = computed(() => {
  const birth = new Date(store.athlete.birthDate)
  const now = new Date()
  return Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
})

const prsByDiscipline = computed(() => {
  const result: Record<string, { result: string; date: string }> = {}
  for (const disc of store.athlete.disciplines) {
    const discMarks = store.marks.filter((m) => m.discipline === disc)
    if (discMarks.length === 0) continue
    const best = discMarks.reduce((b, m) => (m.resultSeconds < b.resultSeconds ? m : b))
    result[disc] = { result: best.result, date: best.date }
  }
  return result
})
</script>

<template>
  <AppLayout>
    <div class="perfil">
      <!-- Hero perfil -->
      <div class="perfil__hero">
        <img
          :src="store.athlete.avatar"
          :alt="store.athlete.name"
          class="perfil__avatar"
        />
        <div class="perfil__info">
          <h1 class="perfil__name">{{ store.athlete.name }}</h1>
          <p class="perfil__club">{{ store.athlete.club }}</p>
          <div class="perfil__disciplines">
            <span
              v-for="disc in store.athlete.disciplines"
              :key="disc"
              class="discipline-chip"
            >
              {{ disc }}
            </span>
          </div>
        </div>
      </div>

      <!-- Stats de carrera -->
      <section class="stats-section">
        <h2 class="section-title">Stats de carrera</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <p class="stat-card__value">{{ store.athlete.yearsActive }}</p>
            <p class="stat-card__label">Años activo</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__value">{{ totalCompetitions }}</p>
            <p class="stat-card__label">Competencias</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__value">{{ prs }}</p>
            <p class="stat-card__label">Records personales</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__value">{{ age }}</p>
            <p class="stat-card__label">Años de edad</p>
          </div>
        </div>
      </section>

      <!-- Acumulado de medallas -->
      <section class="medals-section">
        <h2 class="section-title">Palmarés</h2>
        <MedalCounter />
      </section>

      <!-- Récords personales -->
      <section class="prs-section">
        <h2 class="section-title">Mejores marcas personales</h2>
        <div class="prs-list">
          <div
            v-for="(data, disc) in prsByDiscipline"
            :key="disc"
            class="pr-item"
          >
            <div class="pr-item__discipline">{{ disc }}</div>
            <div class="pr-item__result">{{ data.result }}</div>
            <div class="pr-item__date">
              {{ new Date(data.date).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }) }}
            </div>
          </div>
        </div>
      </section>

      <!-- Info personal -->
      <section class="info-section">
        <h2 class="section-title">Información personal</h2>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Nombre completo</span>
            <span class="info-value">{{ store.athlete.name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Fecha de nacimiento</span>
            <span class="info-value">{{ new Date(store.athlete.birthDate).toLocaleDateString('es-CL') }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Club</span>
            <span class="info-value">{{ store.athlete.club }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Disciplinas</span>
            <span class="info-value">{{ store.athlete.disciplines.join(', ') }}</span>
          </div>
        </div>
      </section>

      <!-- Configuración placeholder -->
      <section class="config-section">
        <h2 class="section-title">Configuración</h2>
        <div class="config-list">
          <div class="config-item">
            <span>Notificaciones de entrenamiento</span>
            <span class="config-badge">Próximamente</span>
          </div>
          <div class="config-item">
            <span>Sincronizar wearables</span>
            <span class="config-badge">Próximamente</span>
          </div>
          <div class="config-item">
            <span>Exportar datos</span>
            <span class="config-badge">Próximamente</span>
          </div>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<style scoped>
.perfil {
  padding: 24px 16px;
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-bottom: 100px;
}

@media (min-width: 768px) {
  .perfil {
    padding: 32px 40px;
    padding-bottom: 40px;
  }
}

.perfil__hero {
  display: flex;
  align-items: center;
  gap: 20px;
}

.perfil__avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid var(--accent-primary);
}

.perfil__name {
  font-size: 22px;
  font-weight: var(--font-weight-display);
  color: var(--color-heading);
  margin-bottom: 4px;
}

.perfil__club {
  font-size: 14px;
  color: var(--vt-c-text-dark-2);
  margin-bottom: 10px;
}

.perfil__disciplines {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.discipline-chip {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(91, 94, 244, 0.15);
  border: 1px solid rgba(91, 94, 244, 0.3);
  color: var(--accent-primary);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vt-c-text-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 16px;
  text-align: center;
  box-shadow: var(--card-shadow);
}

.stat-card__value {
  font-size: 28px;
  font-weight: var(--font-weight-display);
  color: var(--accent-primary);
}

.stat-card__label {
  font-size: 11px;
  color: var(--vt-c-text-dark-2);
  margin-top: 4px;
}

.prs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pr-item {
  background: var(--glass-bg);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--card-shadow);
}

.pr-item__discipline {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-heading);
  min-width: 50px;
}

.pr-item__result {
  font-size: 20px;
  font-weight: var(--font-weight-display);
  color: var(--color-success);
  flex: 1;
}

.pr-item__date {
  font-size: 12px;
  color: var(--vt-c-text-dark-2);
}

.info-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--glass-border);
  gap: 12px;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 13px;
  color: var(--vt-c-text-dark-2);
}

.info-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-heading);
  text-align: right;
}

.config-list {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--glass-border);
  font-size: 14px;
  color: var(--color-heading);
}

.config-item:last-child {
  border-bottom: none;
}

.config-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--vt-c-text-dark-2);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  padding: 3px 8px;
  border-radius: 10px;
}
</style>
