<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import ProgressChart from '@/components/charts/ProgressChart.vue'
import { useAthleteStore } from '@/stores/athlete'
import { computed } from 'vue'

const store = useAthleteStore()

const prMark = computed(() => store.personalRecord)

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <AppLayout>
    <div class="marcas">
      <div class="marcas__header">
        <h1 class="page-title">Marcas &amp; Progreso</h1>
        <p class="page-subtitle">Tu historial de rendimiento en competencias oficiales</p>
      </div>

      <!-- Selector de disciplina -->
      <div class="discipline-tabs">
        <button
          v-for="disc in store.disciplines"
          :key="disc"
          class="discipline-tab"
          :class="{ 'discipline-tab--active': store.selectedDiscipline === disc }"
          @click="store.setDiscipline(disc)"
        >
          {{ disc }}
        </button>
      </div>

      <!-- PR Banner -->
      <div v-if="prMark" class="pr-banner">
        <div class="pr-banner__badge">🏆 Récord Personal</div>
        <div class="pr-banner__content">
          <p class="pr-banner__result">{{ prMark.result }}</p>
          <p class="pr-banner__meta">{{ prMark.competition }} · {{ formatDate(prMark.date) }}</p>
        </div>
      </div>

      <!-- Gráfico principal -->
      <div class="chart-card">
        <div class="chart-card__header">
          <h2 class="chart-card__title">Curva de progreso — {{ store.selectedDiscipline }}</h2>
          <span class="chart-legend">
            <span class="legend-dot legend-dot--pr" /> PR
            <span class="legend-dot legend-dot--normal" /> Competencia
          </span>
        </div>
        <ProgressChart :marks="store.marksByDiscipline" :discipline="store.selectedDiscipline" />
      </div>

      <!-- Tabla de resultados -->
      <div class="results-table-wrap">
        <h2 class="section-title">Historial de resultados</h2>
        <div class="results-table">
          <div class="results-table__head">
            <span>Competencia</span>
            <span>Fecha</span>
            <span>Marca</span>
            <span>Pos.</span>
          </div>
          <div
            v-for="mark in [...store.marksByDiscipline].reverse()"
            :key="mark.id"
            class="results-table__row"
            :class="{ 'results-table__row--pr': mark.isPR }"
          >
            <span class="results-table__name">
              {{ mark.competition }}
              <span v-if="mark.isPR" class="pr-chip">PR</span>
            </span>
            <span class="results-table__date">{{ formatDate(mark.date) }}</span>
            <span class="results-table__result" :class="{ 'results-table__result--pr': mark.isPR }">
              {{ mark.result }}
            </span>
            <span class="results-table__rank">{{ mark.ranking ? `#${mark.ranking}` : '—' }}</span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.marcas {
  padding: 24px 16px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 768px) {
  .marcas {
    padding: 32px 40px;
  }
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

.discipline-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.discipline-tab {
  padding: 8px 18px;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--vt-c-text-dark-2);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.discipline-tab--active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

.pr-banner {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.pr-banner__badge {
  font-size: 14px;
  font-weight: 700;
  color: #10b981;
  white-space: nowrap;
}

.pr-banner__result {
  font-size: 28px;
  font-weight: 800;
  color: #10b981;
}

.pr-banner__meta {
  font-size: 13px;
  color: var(--vt-c-text-dark-2);
}

.chart-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 20px;
}

.chart-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.chart-card__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-heading);
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--vt-c-text-dark-2);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.legend-dot--pr { background: #10b981; }
.legend-dot--normal { background: #6366f1; }

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vt-c-text-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 12px;
}

.results-table {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
}

.results-table__head {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--glass-border);
  font-size: 11px;
  font-weight: 600;
  color: var(--vt-c-text-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.results-table__row {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--glass-border);
  align-items: center;
  transition: background 0.15s;
}

.results-table__row:last-child {
  border-bottom: none;
}

.results-table__row:hover {
  background: rgba(255,255,255,0.02);
}

.results-table__row--pr {
  background: rgba(16, 185, 129, 0.04);
}

.results-table__name {
  font-size: 13px;
  color: var(--color-heading);
  display: flex;
  align-items: center;
  gap: 8px;
}

.pr-chip {
  font-size: 10px;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 1px 6px;
  border-radius: 10px;
}

.results-table__date {
  font-size: 12px;
  color: var(--vt-c-text-dark-2);
  white-space: nowrap;
}

.results-table__result {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-heading);
}

.results-table__result--pr {
  color: #10b981;
}

.results-table__rank {
  font-size: 13px;
  font-weight: 600;
  color: var(--vt-c-text-dark-2);
  text-align: center;
}
</style>
