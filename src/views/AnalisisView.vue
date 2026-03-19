<script setup lang="ts">
import { computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Tooltip, Legend
} from 'chart.js'
import { useAthleteStore } from '@/stores/athlete'
import AppIcon from '@/components/ui/AppIcon.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const store = useAthleteStore()

// ─── Datos base ───────────────────────────────────────────────
const sorted = computed(() =>
  [...store.throws].sort((a, b) => a.date.localeCompare(b.date))
)

// ─── Tendencia ────────────────────────────────────────────────
const trend = computed(() => {
  const recent = [...store.throws]
    .sort((a, b) => b.date.localeCompare(a.date))
  if (recent.length < 2) return { direction: 'neutral', delta: '—', label: 'Sin datos suficientes' }
  const lastFive  = recent.slice(0, 5)
  const prevFive  = recent.slice(5, 10)
  if (!prevFive.length) return { direction: 'neutral', delta: '—', label: 'Sin datos suficientes' }
  const avgLast = lastFive.reduce((s, t) => s + t.mark, 0) / lastFive.length
  const avgPrev = prevFive.reduce((s, t) => s + t.mark, 0) / prevFive.length
  const delta = avgLast - avgPrev
  return {
    direction: delta > 0 ? 'improving' : delta < 0 ? 'declining' : 'neutral',
    delta: `${delta > 0 ? '+' : ''}${delta.toFixed(2)} m`,
    label: `Promedio últimas 5 competencias vs anteriores 5`
  }
})

// ─── Mejor marca por año ─────────────────────────────────────
const bestByYear = computed(() => {
  const byYear: Record<string, number> = {}
  store.throws.forEach(t => {
    const y = t.date.slice(0, 4)
    if (!byYear[y] || t.mark > byYear[y]!) byYear[y] = t.mark
  })
  const years = Object.keys(byYear).sort()
  return { years, bests: years.map(y => byYear[y]!) }
})

const barData = computed(() => ({
  labels: bestByYear.value.years,
  datasets: [{
    label: 'Mejor marca (m)',
    data: bestByYear.value.bests,
    backgroundColor: bestByYear.value.years.map((_, i) =>
      i === bestByYear.value.years.length - 1
        ? 'rgba(91,94,244,0.85)'
        : 'rgba(91,94,244,0.4)'
    ),
    borderColor: '#5b5ef4',
    borderWidth: 1,
    borderRadius: 6,
  }]
}))

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#fff',
      borderColor: 'rgba(0,0,0,0.09)',
      borderWidth: 1,
      titleColor: '#111827',
      bodyColor: '#6b7280',
      callbacks: { label: (item: any) => ` ${item.raw} m` }
    }
  },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#9ca3af' } },
    y: {
      min: 53, max: 66,
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: { color: '#9ca3af', callback: (v: any) => `${v} m` }
    }
  }
}

// ─── Local vs Internacional ───────────────────────────────────
const sourceStats = computed(() => {
  const local = store.throws.filter(t => t.source === 'local')
  const intl  = store.throws.filter(t => t.source === 'international')
  const bestLocal = local.reduce((b, t) => (t.mark > b ? t.mark : b), 0)
  const bestIntl  = intl.reduce((b, t) => (t.mark > b ? t.mark : b), 0)
  const avgLocal  = local.length ? local.reduce((s, t) => s + t.mark, 0) / local.length : 0
  const avgIntl   = intl.length  ? intl.reduce((s, t) => s + t.mark, 0) / intl.length  : 0
  return { local: local.length, intl: intl.length, bestLocal, bestIntl, avgLocal, avgIntl }
})

const doughnutData = computed(() => ({
  labels: ['Local', 'Internacional'],
  datasets: [{
    data: [sourceStats.value.local, sourceStats.value.intl],
    backgroundColor: ['rgba(55,138,221,0.75)', 'rgba(239,159,39,0.75)'],
    borderColor: ['#378ADD', '#EF9F27'],
    borderWidth: 2,
  }]
}))

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#fff',
      borderColor: 'rgba(0,0,0,0.09)',
      borderWidth: 1,
      titleColor: '#111827',
      bodyColor: '#6b7280',
    }
  }
}

// ─── Top 5 marcas ─────────────────────────────────────────────
const top5 = computed(() =>
  [...store.throws]
    .sort((a, b) => b.mark - a.mark)
    .slice(0, 5)
)

// ─── Victorias por año ────────────────────────────────────────
const winsByYear = computed(() => {
  const byYear: Record<string, number> = {}
  store.throws.filter(t => t.place === 1).forEach(t => {
    const y = t.date.slice(0, 4)
    byYear[y] = (byYear[y] ?? 0) + 1
  })
  return byYear
})

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}
</script>

<template>
  <div class="analisis">
    <!-- Header -->
    <div class="analisis__header">
      <h1 class="page-title">Análisis</h1>
      <p class="page-subtitle">Lanzamiento de disco · estadísticas avanzadas</p>
    </div>

    <!-- Tendencia -->
    <div
      class="trend-banner"
      :class="{
        'trend-banner--up':   trend.direction === 'improving',
        'trend-banner--down': trend.direction === 'declining',
        'trend-banner--flat': trend.direction === 'neutral',
      }"
    >
      <div class="trend-icon">
        <AppIcon
          :name="trend.direction === 'improving' ? 'TrendingUp' : trend.direction === 'declining' ? 'TrendingDown' : 'Minus'"
          :size="22"
        />
      </div>
      <div>
        <p class="trend-title">
          {{ trend.direction === 'improving' ? 'Forma ascendente' : trend.direction === 'declining' ? 'Forma descendente' : 'Forma estable' }}
          <strong>{{ trend.delta }}</strong>
        </p>
        <p class="trend-meta">{{ trend.label }}</p>
      </div>
    </div>

    <!-- Mejor marca por año -->
    <div class="chart-card">
      <h2 class="chart-card__title">Mejor marca por temporada</h2>
      <div class="chart-area">
        <Bar :data="barData" :options="barOptions" />
      </div>
    </div>

    <!-- Dos columnas: distribución + top 5 -->
    <div class="two-col">
      <!-- Distribución local / internacional -->
      <div class="chart-card">
        <h2 class="chart-card__title">Local vs. Internacional</h2>
        <div class="doughnut-layout">
          <div class="doughnut-canvas">
            <Doughnut :data="doughnutData" :options="doughnutOptions" />
          </div>
          <div class="source-stats">
            <div class="source-item source-item--local">
              <div class="source-dot" style="background:#378ADD"></div>
              <div>
                <p class="source-label">Local ({{ sourceStats.local }})</p>
                <p class="source-best">Mejor: {{ sourceStats.bestLocal.toFixed(2) }} m</p>
                <p class="source-avg">Prom: {{ sourceStats.avgLocal.toFixed(2) }} m</p>
              </div>
            </div>
            <div class="source-item source-item--intl">
              <div class="source-dot" style="background:#EF9F27"></div>
              <div>
                <p class="source-label">Internacional ({{ sourceStats.intl }})</p>
                <p class="source-best">Mejor: {{ sourceStats.bestIntl.toFixed(2) }} m</p>
                <p class="source-avg">Prom: {{ sourceStats.avgIntl.toFixed(2) }} m</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top 5 marcas all-time -->
      <div class="chart-card">
        <h2 class="chart-card__title">Top 5 all-time</h2>
        <div class="top5-list">
          <div v-for="(t, i) in top5" :key="t.id" class="top5-row">
            <span class="top5-rank" :class="`top5-rank--${i + 1}`">{{ i + 1 }}</span>
            <div class="top5-info">
              <p class="top5-mark">{{ t.mark.toFixed(2) }} m</p>
              <p class="top5-comp">{{ t.competition }}</p>
              <p class="top5-date">{{ formatDate(t.date) }}</p>
            </div>
            <span v-if="t.pb" class="pr-tag">PR</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Victorias por año -->
    <div class="chart-card wins-card">
      <h2 class="chart-card__title">Victorias (1° lugar) por temporada</h2>
      <div class="wins-row">
        <div
          v-for="(wins, year) in winsByYear"
          :key="year"
          class="wins-year"
        >
          <span class="wins-count">{{ wins }}</span>
          <span class="wins-year-label">{{ year }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analisis {
  padding: 24px 16px 100px;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (min-width: 1024px) {
  .analisis { padding: 32px 40px 60px; }
}

.page-title { font-size: 24px; font-weight: 800; color: var(--color-heading); }
.page-subtitle { font-size: 14px; color: var(--color-text-muted); margin-top: 2px; }

/* Trend */
.trend-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 16px;
  border: 1px solid;
}
.trend-banner--up   { background: rgba(16,185,129,0.06);  border-color: rgba(16,185,129,0.25);  }
.trend-banner--down { background: rgba(239, 68, 68,0.06); border-color: rgba(239, 68, 68,0.25); }
.trend-banner--flat { background: var(--glass-bg);        border-color: var(--glass-border);    }

.trend-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.trend-banner--up   .trend-icon { background: rgba(16,185,129,0.12);  color: #10b981; }
.trend-banner--down .trend-icon { background: rgba(239, 68, 68,0.12); color: #ef4444; }
.trend-banner--flat .trend-icon { background: var(--glass-bg);        color: var(--color-text-muted); }

.trend-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-heading);
  display: flex;
  gap: 8px;
  align-items: baseline;
}
.trend-meta { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }

/* Cards */
.chart-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.chart-card__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-heading);
}
.chart-area { position: relative; height: 220px; }

/* Two-col layout */
.two-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (min-width: 768px) {
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}

/* Doughnut */
.doughnut-layout {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}
.doughnut-canvas { width: 140px; height: 140px; flex-shrink: 0; }
.source-stats { display: flex; flex-direction: column; gap: 16px; }
.source-item { display: flex; align-items: flex-start; gap: 10px; }
.source-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 3px; flex-shrink: 0; }
.source-label { font-size: 13px; font-weight: 700; color: var(--color-heading); }
.source-best  { font-size: 12px; color: var(--color-text-muted); }
.source-avg   { font-size: 12px; color: var(--color-text-muted); }

/* Top 5 */
.top5-list { display: flex; flex-direction: column; gap: 10px; }
.top5-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--color-background);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
}
.top5-rank {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
  background: var(--glass-bg);
  color: var(--color-text-muted);
}
.top5-rank--1 { background: #fef3c7; color: #d97706; }
.top5-rank--2 { background: #f1f5f9; color: #64748b; }
.top5-rank--3 { background: #fff7ed; color: #c2410c; }

.top5-info { flex: 1; min-width: 0; }
.top5-mark { font-size: 15px; font-weight: 800; color: var(--color-heading); }
.top5-comp { font-size: 11px; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.top5-date { font-size: 11px; color: var(--color-text-muted); }

.pr-tag {
  font-size: 9px;
  font-weight: 900;
  background: #E24B4A;
  color: #fff;
  padding: 2px 5px;
  border-radius: 4px;
  flex-shrink: 0;
}

/* Wins */
.wins-card { }
.wins-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.wins-year {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: var(--color-background);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 14px 16px;
  min-width: 60px;
}
.wins-count {
  font-size: 22px;
  font-weight: 800;
  color: var(--accent-primary);
}
.wins-year-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
}
</style>
