<script setup lang="ts">
import { computed } from 'vue'
import CompareChart from '@/components/charts/CompareChart.vue'
import { useAthleteStore } from '@/stores/athlete'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const store = useAthleteStore()

// Mejor marca por año (400m)
const marksByYear = computed(() => {
  const byYear: Record<string, number> = {}
  store.marks
    .filter((m) => m.discipline === '400m')
    .forEach((m) => {
      const year = m.date.slice(0, 4)
      if (!byYear[year] || m.resultSeconds < byYear[year]) {
        byYear[year] = m.resultSeconds
      }
    })
  return byYear
})

const barData = computed(() => ({
  labels: Object.keys(marksByYear.value),
  datasets: [
    {
      label: 'Mejor marca 400m (s)',
      data: Object.values(marksByYear.value),
      backgroundColor: 'rgba(99, 102, 241, 0.7)',
      borderColor: '#6366f1',
      borderWidth: 1,
      borderRadius: 8,
    },
  ],
}))

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#94a3b8' },
    },
    y: {
      reverse: true,
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#94a3b8', callback: (val: number | string) => `${val}s` },
      min: 46,
      max: 51,
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(10,10,10,0.95)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#f8fafc',
      bodyColor: '#94a3b8',
    },
  },
}

// Distribución de carga
const doughnutData = computed(() => ({
  labels: ['Velocidad', 'Fondo', 'Técnica', 'Fuerza'],
  datasets: [
    {
      data: [
        store.sessionsByType.velocidad,
        store.sessionsByType.fondo,
        store.sessionsByType.tecnica,
        store.sessionsByType.fuerza,
      ],
      backgroundColor: ['rgba(99,102,241,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)'],
      borderColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 2,
    },
  ],
}))

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { size: 12 } },
    },
    tooltip: {
      backgroundColor: 'rgba(10,10,10,0.95)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#f8fafc',
      bodyColor: '#94a3b8',
    },
  },
}

// Tendencia últimos 3 meses
const trend = computed(() => {
  const marks400 = store.marks
    .filter((m) => m.discipline === '400m')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (marks400.length < 2) return { direction: 'neutral', delta: '—' }
  const latest = marks400[0]!.resultSeconds
  const prev = marks400[Math.min(3, marks400.length - 1)]!.resultSeconds
  const delta = prev - latest
  return {
    direction: delta > 0 ? 'improving' : delta < 0 ? 'declining' : 'neutral',
    delta: delta > 0 ? `-${delta.toFixed(2)}s` : `+${Math.abs(delta).toFixed(2)}s`,
  }
})
</script>

<template>
  <div class="analisis">
      <div class="analisis__header">
        <h1 class="page-title">Análisis</h1>
        <p class="page-subtitle">Métricas avanzadas y comparativas</p>
      </div>

      <!-- Tendencia -->
      <div
        class="trend-banner"
        :class="{
          'trend-banner--improving': trend.direction === 'improving',
          'trend-banner--declining': trend.direction === 'declining',
        }"
      >
        <span class="trend-icon">{{ trend.direction === 'improving' ? '📈' : trend.direction === 'declining' ? '📉' : '➡️' }}</span>
        <div>
          <p class="trend-title">
            {{ trend.direction === 'improving' ? 'Mejorando' : trend.direction === 'declining' ? 'Empeorando' : 'Estable' }}
          </p>
          <p class="trend-meta">
            {{ trend.delta }} en los últimos 3 resultados vs. la marca más reciente (400m)
          </p>
        </div>
      </div>

      <!-- Progresión anual -->
      <div class="chart-card">
        <h2 class="chart-card__title">Mejor marca por año — 400m</h2>
        <div style="height: 220px;">
          <Bar :data="barData" :options="barOptions" />
        </div>
      </div>

      <!-- Comparativa vs rivales -->
      <div class="chart-card">
        <h2 class="chart-card__title">Comparativa vs. rivales — 400m</h2>
        <CompareChart :myMarks="store.marks" :rivals="store.rivals" discipline="400m" />
        <div class="rivals-legend">
          <div v-for="rival in store.rivals" :key="rival.id" class="rivals-legend__item">
            <span class="rivals-legend__name">{{ rival.name }}</span>
            <span class="rivals-legend__club">{{ rival.club }}</span>
          </div>
        </div>
      </div>

      <!-- Distribución de carga -->
      <div class="chart-card">
        <h2 class="chart-card__title">Distribución de entrenamientos</h2>
        <div class="doughnut-wrap">
          <div style="height: 200px; width: 200px;">
            <Doughnut :data="doughnutData" :options="doughnutOptions" />
          </div>
          <div class="doughnut-stats">
            <div v-for="(count, type) in store.sessionsByType" :key="type" class="doughnut-stat">
              <p class="doughnut-stat__name">{{ { velocidad: 'Velocidad', fondo: 'Fondo', tecnica: 'Técnica', fuerza: 'Fuerza' }[type as 'velocidad'|'fondo'|'tecnica'|'fuerza'] }}</p>
              <p class="doughnut-stat__pct">{{ Math.round((count / store.sessions.length) * 100) }}%</p>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<style scoped>
.analisis {
  padding: 24px 16px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 1024px) {
  .analisis {
    padding: 32px 40px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-areas: 
      "header header"
      "banner banner"
      "annual rivals"
      "doughnut annual" /* Adjusted for flow */
      "doughnut rivals";
    gap: 32px;
  }
  
  .analisis__header { grid-area: header; }
  .trend-banner { grid-area: banner; }
  .chart-card:nth-of-type(1) { grid-area: annual; }
  .chart-card:nth-of-type(2) { grid-area: rivals; }
  .chart-card:nth-of-type(3) { grid-area: doughnut; }
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-heading);
}

.page-subtitle {
  font-size: 14px;
  color: var(--vt-c-text-dark-2);
  margin-top: 4px;
}

.trend-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 16px;
  border: 1px solid;
}

.trend-banner--improving {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.3);
}

.trend-banner--declining {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.3);
}

.trend-icon {
  font-size: 28px;
}

.trend-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-heading);
}

.trend-meta {
  font-size: 13px;
  color: var(--vt-c-text-dark-2);
}

.chart-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-card__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-heading);
}

.rivals-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.rivals-legend__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rivals-legend__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-heading);
}

.rivals-legend__club {
  font-size: 11px;
  color: var(--vt-c-text-dark-2);
}

.doughnut-wrap {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
}

.doughnut-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.doughnut-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.doughnut-stat__name {
  font-size: 13px;
  color: var(--vt-c-text-dark-2);
}

.doughnut-stat__pct {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-heading);
}
</style>
