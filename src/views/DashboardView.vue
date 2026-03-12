<script setup lang="ts">
import { computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import KpiCard from '@/components/ui/KpiCard.vue'
import SparklineChart from '@/components/charts/SparklineChart.vue'
import SessionCard from '@/components/ui/SessionCard.vue'
import { useAthleteStore } from '@/stores/athlete'

const store = useAthleteStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
})

const marks400m = computed(() => store.marks.filter((m) => m.discipline === '400m'))

const daysUntilCompetition = computed(() => {
  const target = new Date(store.nextCompetition.date)
  const now = new Date()
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
})
</script>

<template>
  <AppLayout>
    <div class="dashboard">
      <!-- Header -->
      <div class="dashboard__header">
        <div class="dashboard__greeting">
          <img :src="store.athlete.avatar" :alt="store.athlete.name" class="dashboard__avatar" />
          <div>
            <p class="dashboard__hello">{{ greeting }}, {{ store.athlete.name.split(' ')[0] }} 👋</p>
            <p class="dashboard__club">{{ store.athlete.club }}</p>
          </div>
        </div>
        <div class="dashboard__badge">
          <span>🏅</span>
          <span>{{ store.athlete.disciplines.join(' · ') }}</span>
        </div>
      </div>

      <!-- KPI Cards -->
      <section class="dashboard__section">
        <h2 class="section-title">Resumen</h2>
        <div class="kpi-grid">
          <KpiCard
            label="Mejor marca"
            :value="store.kpis.bestMark.result"
            :subtitle="store.kpis.bestMark.discipline"
            color="success"
            icon="medal"
          />
          <KpiCard
            label="Último entreno"
            :value="`Hace ${store.kpis.lastSession.daysAgo}d`"
            :subtitle="store.kpis.lastSession.type"
            color="primary"
            icon="clock"
          />
          <KpiCard
            label="Próxima competencia"
            :value="`${daysUntilCompetition}d`"
            :subtitle="store.nextCompetition.name"
            color="warning"
            icon="calendar"
          />
          <KpiCard
            label="Racha"
            :value="`${store.kpis.streak} sem`"
            subtitle="semanas consecutivas"
            color="danger"
            icon="fire"
          />
        </div>
      </section>

      <!-- Sparkline -->
      <section class="dashboard__section">
        <div class="sparkline-header">
          <h2 class="section-title">Progresión 400m</h2>
          <RouterLink to="/marcas" class="see-all">Ver todo →</RouterLink>
        </div>
        <div class="sparkline-card">
          <div class="sparkline-card__stats">
            <div>
              <p class="sparkline-card__label">PR Actual</p>
              <p class="sparkline-card__value">47.1s</p>
            </div>
            <div>
              <p class="sparkline-card__label">Tendencia</p>
              <p class="sparkline-card__trend">📈 Mejorando</p>
            </div>
          </div>
          <SparklineChart :marks="marks400m" />
        </div>
      </section>

      <!-- Feed reciente -->
      <section class="dashboard__section">
        <div class="feed-header">
          <h2 class="section-title">Actividad reciente</h2>
        </div>
        <div class="feed-list">
          <div class="feed-item feed-item--mark" v-for="mark in store.recentMarks.slice(0, 3)" :key="mark.id">
            <span class="feed-item__icon">🏆</span>
            <div class="feed-item__content">
              <p class="feed-item__title">{{ mark.competition }}</p>
              <p class="feed-item__meta">{{ mark.discipline }} · {{ mark.result }}</p>
            </div>
            <span v-if="mark.isPR" class="feed-item__pr">PR</span>
          </div>
          <SessionCard
            v-for="session in store.recentSessions.slice(0, 2)"
            :key="session.id"
            :session="session"
          />
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<style scoped>
.dashboard {
  padding: 24px 16px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

@media (min-width: 768px) {
  .dashboard {
    padding: 32px 40px;
  }
}

.dashboard__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.dashboard__greeting {
  display: flex;
  align-items: center;
  gap: 14px;
}

.dashboard__avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid var(--accent-primary);
}

.dashboard__hello {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-heading);
}

.dashboard__club {
  font-size: 13px;
  color: var(--vt-c-text-dark-2);
}

.dashboard__badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  font-size: 13px;
  color: var(--vt-c-text-dark-2);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vt-c-text-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 12px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 768px) {
  .kpi-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.sparkline-header,
.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sparkline-header .section-title,
.feed-header .section-title {
  margin-bottom: 0;
}

.see-all {
  font-size: 13px;
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 500;
}

.sparkline-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
}

.sparkline-card__stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sparkline-card__label {
  font-size: 11px;
  color: var(--vt-c-text-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.sparkline-card__value {
  font-size: 24px;
  font-weight: 700;
  color: #10b981;
}

.sparkline-card__trend {
  font-size: 14px;
  color: #10b981;
  font-weight: 600;
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feed-item {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.feed-item__icon {
  font-size: 22px;
  flex-shrink: 0;
}

.feed-item__content {
  flex: 1;
  min-width: 0;
}

.feed-item__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-heading);
}

.feed-item__meta {
  font-size: 12px;
  color: var(--vt-c-text-dark-2);
}

.feed-item__pr {
  font-size: 11px;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 3px 8px;
  border-radius: 20px;
}
</style>
