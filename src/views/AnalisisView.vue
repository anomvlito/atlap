<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Tooltip, Legend,
  type TooltipItem,
} from 'chart.js'
import { useAthleteStore } from '@/stores/athlete'
import AppIcon from '@/components/ui/AppIcon.vue'
import MultifactorRadar from '@/components/charts/MultifactorRadar.vue'
import { useMultifactor } from '@/services/multifactor'
import { getDisciplineConfig, formatResult } from '@/types/discipline'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const store = useAthleteStore()
const { narrative, scores } = useMultifactor()

type Tab = 'espiral' | 'marcas'
const activeTab = ref<Tab>('espiral')

// ─── Espiral: selector de ciclo ───────────────────────────────
const selectedCycleIdx = ref(scores.value.length - 1)
const selectedScore = computed(() => scores.value[selectedCycleIdx.value] ?? null)
const prevScore = computed(() => scores.value[selectedCycleIdx.value - 1] ?? null)

const phaseLabel: Record<string, string> = {
  fuerza: 'Fuerza',
  potencia: 'Potencia',
  competencia: 'Competencia',
  descanso: 'Descanso',
  vacaciones: 'Vacaciones',
}

const phaseColor: Record<string, string> = {
  fuerza: '#5b5ef4',
  potencia: '#EF9F27',
  competencia: '#E24B4A',
  descanso: '#10b981',
  vacaciones: '#8b5cf6',
}

// ─── Marcas: disciplina activa (sincronizada con el store) ────
const activeDiscipline = computed({
  get: () => store.selectedDiscipline,
  set: (d) => store.setDiscipline(d),
})

const disciplineConfig = computed(() => getDisciplineConfig(activeDiscipline.value))
const betterIs = computed(() => disciplineConfig.value?.betterIs ?? 'lower')
const resultUnit = computed(() => disciplineConfig.value?.resultUnit ?? 'seconds')

const filteredMarks = computed(() =>
  store.marks
    .filter((m) => m.discipline === activeDiscipline.value)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date)),
)

// ─── Tendencia: últimas 5 vs anteriores 5 ────────────────────
const trend = computed(() => {
  const sorted = [...filteredMarks.value].sort((a, b) => b.date.localeCompare(a.date))
  if (sorted.length < 2) return { direction: 'neutral', delta: '—', label: 'Sin datos suficientes' }
  const last5 = sorted.slice(0, 5)
  const prev5 = sorted.slice(5, 10)
  if (!prev5.length) return { direction: 'neutral', delta: '—', label: 'Sin datos suficientes' }
  const avgLast = last5.reduce((s, m) => s + m.resultValue, 0) / last5.length
  const avgPrev = prev5.reduce((s, m) => s + m.resultValue, 0) / prev5.length
  const raw = avgLast - avgPrev
  const improving = betterIs.value === 'lower' ? raw < 0 : raw > 0
  const sign = raw > 0 ? '+' : ''
  const deltaStr =
    resultUnit.value === 'seconds' ? `${sign}${raw.toFixed(2)}s` : `${sign}${raw.toFixed(2)}m`
  return {
    direction: improving ? 'improving' : raw === 0 ? 'neutral' : 'declining',
    delta: deltaStr,
    label: 'Promedio últimas 5 marcas vs anteriores 5',
  }
})

// ─── Mejor marca por año ──────────────────────────────────────
const bestByYear = computed(() => {
  const byYear: Record<string, number> = {}
  for (const m of filteredMarks.value) {
    const y = m.date.slice(0, 4)
    const prev = byYear[y]
    const isBetter =
      prev === undefined ||
      (betterIs.value === 'lower' ? m.resultValue < prev : m.resultValue > prev)
    if (isBetter) byYear[y] = m.resultValue
  }
  const years = Object.keys(byYear).sort()
  return { years, bests: years.map((y) => byYear[y]!) }
})

const barData = computed(() => ({
  labels: bestByYear.value.years,
  datasets: [
    {
      label: `Mejor marca (${disciplineConfig.value?.resultLabel ?? ''})`,
      data: bestByYear.value.bests,
      backgroundColor: bestByYear.value.years.map((_, i) =>
        i === bestByYear.value.years.length - 1 ? 'rgba(91,94,244,0.85)' : 'rgba(91,94,244,0.4)',
      ),
      borderColor: '#5b5ef4',
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
}))

const barYBounds = computed(() => {
  const vals = bestByYear.value.bests
  if (!vals.length) return { min: 0, max: 100 }
  const minVal = Math.min(...vals)
  const maxVal = Math.max(...vals)
  const pad = (maxVal - minVal) * 0.15 || 1
  return { min: Math.floor(minVal - pad), max: Math.ceil(maxVal + pad) }
})

const barOptions = computed(() => ({
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
      callbacks: {
        label: (item: TooltipItem<'bar'>) =>
          ` ${formatResult(item.raw as number, resultUnit.value)}`,
      },
    },
  },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#9ca3af' } },
    y: {
      min: barYBounds.value.min,
      max: barYBounds.value.max,
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: {
        color: '#9ca3af',
        callback: (v: number | string) => formatResult(Number(v), resultUnit.value),
      },
    },
  },
}))

// ─── Distribución por disciplina (doughnut) ───────────────────
const discDist = computed(() => {
  const counts: Record<string, number> = {}
  for (const m of store.marks) {
    counts[m.discipline] = (counts[m.discipline] ?? 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
})

const DISC_COLORS = [
  'rgba(91,94,244,0.75)',
  'rgba(239,159,39,0.75)',
  'rgba(226,75,74,0.75)',
  'rgba(16,185,129,0.75)',
  'rgba(139,92,246,0.75)',
]

const doughnutData = computed(() => ({
  labels: discDist.value.map(([d]) => d),
  datasets: [
    {
      data: discDist.value.map(([, c]) => c),
      backgroundColor: discDist.value.map((_, i) => DISC_COLORS[i % DISC_COLORS.length]),
      borderColor: 'transparent',
      borderWidth: 0,
    },
  ],
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
    },
  },
}

// ─── Top 5 all-time para la disciplina activa ─────────────────
const top5 = computed(() =>
  [...filteredMarks.value]
    .sort((a, b) =>
      betterIs.value === 'lower'
        ? a.resultValue - b.resultValue
        : b.resultValue - a.resultValue,
    )
    .slice(0, 5),
)

// ─── Podios por año (ranking ≤ 3, todas disciplinas) ─────────
const podiosByYear = computed(() => {
  const byYear: Record<string, number> = {}
  store.marks
    .filter((m) => m.ranking !== null && m.ranking! <= 3)
    .forEach((m) => {
      const y = m.date.slice(0, 4)
      byYear[y] = (byYear[y] ?? 0) + 1
    })
  return byYear
})

// ─── Helpers espiral ──────────────────────────────────────────
type AxisKey = 'velocidad' | 'fisico' | 'tecnica' | 'mental' | 'recuperacion' | 'contexto'

function axisVal(score: typeof selectedScore.value, key: AxisKey): number {
  if (!score) return 0
  return score[key]
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="analisis">
    <!-- Header + tabs -->
    <div class="analisis__header">
      <div>
        <h1 class="page-title">Análisis</h1>
        <p class="page-subtitle">Visión integral de tu progreso</p>
      </div>
    </div>

    <div class="tab-row" role="tablist">
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'espiral' }"
        role="tab"
        @click="activeTab = 'espiral'"
      >
        <AppIcon name="Activity" :size="14" />
        Espiral
      </button>
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'marcas' }"
        role="tab"
        @click="activeTab = 'marcas'"
      >
        <AppIcon name="Target" :size="14" />
        Marcas
      </button>
    </div>

    <!-- ══════════════ TAB: ESPIRAL ══════════════ -->
    <template v-if="activeTab === 'espiral'">
      <!-- Ciclo selector -->
      <div v-if="scores.length" class="cycle-selector">
        <button
          v-for="(s, i) in scores"
          :key="s.cycleId"
          class="cycle-pill"
          :class="{ 'cycle-pill--active': selectedCycleIdx === i }"
          :style="
            selectedCycleIdx === i
              ? { borderColor: phaseColor[s.phase], color: phaseColor[s.phase] }
              : {}
          "
          @click="selectedCycleIdx = i"
        >
          {{ phaseLabel[s.phase] ?? s.phase }}
          <span class="cycle-pill__year">{{ s.cycleName.slice(-4) }}</span>
        </button>
      </div>

      <!-- Radar + narrativa -->
      <div v-if="selectedScore" class="espiral-layout">
        <div class="chart-card radar-card">
          <div class="chart-card__title-row">
            <h2 class="chart-card__title">{{ selectedScore.cycleName }}</h2>
            <span
              class="phase-badge"
              :style="{
                background: phaseColor[selectedScore.phase] + '20',
                color: phaseColor[selectedScore.phase],
              }"
            >
              {{ phaseLabel[selectedScore.phase] ?? selectedScore.phase }}
            </span>
          </div>
          <MultifactorRadar :current="selectedScore" :previous="prevScore" />
        </div>

        <!-- Narrativa -->
        <div
          v-if="selectedCycleIdx === scores.length - 1 && narrative.length"
          class="narrative-card"
        >
          <div class="narrative-card__title">
            <AppIcon name="Sparkles" :size="13" />
            Lo que cambió
          </div>
          <p v-for="(line, i) in narrative" :key="i" class="narrative-line">{{ line }}</p>
        </div>

        <!-- Scores detallados -->
        <div class="chart-card axis-detail">
          <h2 class="chart-card__title">Detalle por eje</h2>
          <div class="axis-grid">
            <div
              v-for="axis in [
                { key: 'velocidad', label: 'Velocidad', icon: 'Zap' },
                { key: 'fisico', label: 'Físico', icon: 'Activity' },
                { key: 'tecnica', label: 'Técnica', icon: 'Target' },
                { key: 'mental', label: 'Mental', icon: 'Brain' },
                { key: 'recuperacion', label: 'Recuperación', icon: 'Heart' },
                { key: 'contexto', label: 'Contexto', icon: 'Flag' },
              ]"
              :key="axis.key"
              class="axis-item"
            >
              <div class="axis-item__top">
                <AppIcon :name="axis.icon" :size="14" />
                <span class="axis-label">{{ axis.label }}</span>
                <span class="axis-value">{{ axisVal(selectedScore, axis.key as AxisKey) }}</span>
              </div>
              <div class="axis-bar">
                <div
                  class="axis-bar__fill"
                  :style="{
                    width: axisVal(selectedScore, axis.key as AxisKey) + '%',
                    background: '#5b5ef4',
                  }"
                />
              </div>
              <span
                v-if="prevScore"
                class="axis-delta"
                :class="{
                  'axis-delta--up':
                    axisVal(selectedScore, axis.key as AxisKey) >
                    axisVal(prevScore, axis.key as AxisKey),
                  'axis-delta--down':
                    axisVal(selectedScore, axis.key as AxisKey) <
                    axisVal(prevScore, axis.key as AxisKey),
                }"
              >
                {{
                  axisVal(selectedScore, axis.key as AxisKey) -
                    axisVal(prevScore, axis.key as AxisKey) >
                  0
                    ? '+'
                    : ''
                }}{{ axisVal(selectedScore, axis.key as AxisKey) - axisVal(prevScore, axis.key as AxisKey) }}
                vs ciclo anterior
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <AppIcon name="Activity" :size="32" />
        <p>Sin ciclos de entrenamiento registrados</p>
      </div>
    </template>

    <!-- ══════════════ TAB: MARCAS ══════════════ -->
    <template v-else>
      <!-- Selector de disciplina -->
      <div class="disc-selector">
        <button
          v-for="d in store.disciplines"
          :key="d"
          class="disc-pill"
          :class="{ 'disc-pill--active': activeDiscipline === d }"
          @click="activeDiscipline = d"
        >
          {{ d }}
        </button>
      </div>

      <!-- Tendencia -->
      <div
        class="trend-banner"
        :class="{
          'trend-banner--up': trend.direction === 'improving',
          'trend-banner--down': trend.direction === 'declining',
          'trend-banner--flat': trend.direction === 'neutral',
        }"
      >
        <div class="trend-icon">
          <AppIcon
            :name="
              trend.direction === 'improving'
                ? 'TrendingUp'
                : trend.direction === 'declining'
                  ? 'TrendingDown'
                  : 'Minus'
            "
            :size="22"
          />
        </div>
        <div>
          <p class="trend-title">
            {{
              trend.direction === 'improving'
                ? 'Forma ascendente'
                : trend.direction === 'declining'
                  ? 'Forma descendente'
                  : 'Forma estable'
            }}
            <strong>{{ trend.delta }}</strong>
          </p>
          <p class="trend-meta">{{ trend.label }}</p>
        </div>
      </div>

      <!-- Mejor marca por año -->
      <div class="chart-card">
        <h2 class="chart-card__title">
          Mejor marca por temporada · <span class="disc-label">{{ activeDiscipline }}</span>
        </h2>
        <div v-if="bestByYear.years.length" class="chart-area">
          <Bar :data="barData" :options="barOptions" />
        </div>
        <p v-else class="empty-inline">Sin marcas registradas para esta disciplina.</p>
      </div>

      <!-- Dos columnas -->
      <div class="two-col">
        <!-- Distribución por disciplina -->
        <div class="chart-card">
          <h2 class="chart-card__title">Marcas por disciplina</h2>
          <div class="doughnut-layout">
            <div class="doughnut-canvas">
              <Doughnut :data="doughnutData" :options="doughnutOptions" />
            </div>
            <div class="source-stats">
              <div
                v-for="([disc, count], i) in discDist"
                :key="disc"
                class="source-item"
              >
                <div
                  class="source-dot"
                  :style="{ background: DISC_COLORS[i % DISC_COLORS.length] }"
                />
                <div>
                  <p class="source-label">{{ disc }} ({{ count }})</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top 5 all-time -->
        <div class="chart-card">
          <h2 class="chart-card__title">
            Top 5 all-time · <span class="disc-label">{{ activeDiscipline }}</span>
          </h2>
          <div v-if="top5.length" class="top5-list">
            <div v-for="(m, i) in top5" :key="m.id" class="top5-row">
              <span class="top5-rank" :class="`top5-rank--${i + 1}`">{{ i + 1 }}</span>
              <div class="top5-info">
                <p class="top5-mark">{{ formatResult(m.resultValue, m.resultUnit) }}</p>
                <p class="top5-comp">{{ m.competition }}</p>
                <p class="top5-date">{{ formatDate(m.date) }}</p>
              </div>
              <span v-if="m.isPR" class="pr-tag">PR</span>
            </div>
          </div>
          <p v-else class="empty-inline">Sin marcas para esta disciplina.</p>
        </div>
      </div>

      <!-- Podios por año -->
      <div class="chart-card">
        <h2 class="chart-card__title">Podios (top 3) por temporada · todas las disciplinas</h2>
        <div v-if="Object.keys(podiosByYear).length" class="wins-row">
          <div v-for="(count, year) in podiosByYear" :key="year" class="wins-year">
            <span class="wins-count">{{ count }}</span>
            <span class="wins-year-label">{{ year }}</span>
          </div>
        </div>
        <p v-else class="empty-inline">Sin podios registrados.</p>
      </div>
    </template>
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
  .analisis {
    padding: 32px 40px 60px;
  }
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-heading);
}
.page-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

/* Tabs */
.tab-row {
  display: flex;
  gap: 8px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 6px;
}
.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.tab-btn--active {
  background: var(--color-background);
  color: var(--accent-primary);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

/* Cycle selector */
.cycle-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.cycle-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--glass-border);
  background: var(--glass-bg);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.cycle-pill--active {
  background: var(--color-background);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07);
}
.cycle-pill__year {
  font-size: 10px;
  opacity: 0.7;
  margin-left: 2px;
}

/* Espiral layout */
.espiral-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Radar card */
.radar-card {
  gap: 12px;
}
.chart-card__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.phase-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Narrativa */
.narrative-card {
  background: linear-gradient(
    135deg,
    rgba(91, 94, 244, 0.05) 0%,
    rgba(91, 94, 244, 0.02) 100%
  );
  border: 1px solid rgba(91, 94, 244, 0.15);
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.narrative-card__title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
.narrative-line {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-heading);
  line-height: 1.55;
}

/* Axis detail */
.axis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (min-width: 640px) {
  .axis-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.axis-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.axis-item__top {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--color-text-muted);
}
.axis-label {
  flex: 1;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
}
.axis-value {
  font-size: 14px;
  font-weight: 800;
  color: var(--color-heading);
}
.axis-bar {
  height: 5px;
  background: var(--glass-border);
  border-radius: 3px;
  overflow: hidden;
}
.axis-bar__fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.axis-delta {
  font-size: 10px;
  color: var(--color-text-muted);
}
.axis-delta--up {
  color: #10b981;
}
.axis-delta--down {
  color: #f43f5e;
}

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--color-text-muted);
  font-size: 14px;
}
.empty-inline {
  font-size: 13px;
  color: var(--color-text-muted);
  padding: 8px 0;
}

/* ══ MARCAS ══════════════════════════════════════════════════ */

/* Discipline selector */
.disc-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.disc-pill {
  padding: 5px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--glass-border);
  background: var(--glass-bg);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.disc-pill--active {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: rgba(91, 94, 244, 0.06);
}
.disc-label {
  color: var(--accent-primary);
  font-weight: 700;
}

/* Trend */
.trend-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 16px;
  border: 1px solid;
}
.trend-banner--up {
  background: rgba(16, 185, 129, 0.06);
  border-color: rgba(16, 185, 129, 0.25);
}
.trend-banner--down {
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.25);
}
.trend-banner--flat {
  background: var(--glass-bg);
  border-color: var(--glass-border);
}
.trend-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.trend-banner--up .trend-icon {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}
.trend-banner--down .trend-icon {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}
.trend-banner--flat .trend-icon {
  background: var(--glass-bg);
  color: var(--color-text-muted);
}
.trend-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-heading);
  display: flex;
  gap: 8px;
  align-items: baseline;
}
.trend-meta {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

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
.chart-area {
  position: relative;
  height: 220px;
}

/* Two-col */
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
.doughnut-canvas {
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}
.source-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.source-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.source-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 3px;
  flex-shrink: 0;
}
.source-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-heading);
}

/* Top 5 */
.top5-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
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
.top5-rank--1 {
  background: #fef3c7;
  color: #d97706;
}
.top5-rank--2 {
  background: #f1f5f9;
  color: #64748b;
}
.top5-rank--3 {
  background: #fff7ed;
  color: #c2410c;
}
.top5-info {
  flex: 1;
  min-width: 0;
}
.top5-mark {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-heading);
}
.top5-comp {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.top5-date {
  font-size: 11px;
  color: var(--color-text-muted);
}
.pr-tag {
  font-size: 9px;
  font-weight: 900;
  background: #e24b4a;
  color: #fff;
  padding: 2px 5px;
  border-radius: 4px;
  flex-shrink: 0;
}

/* Wins / Podios */
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
