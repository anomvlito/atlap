<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Tooltip, Filler,
  type TooltipItem,
} from 'chart.js'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAthleteStore } from '@/stores/athlete'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { getDisciplineConfig, formatResult } from '@/types/discipline'
import type { Mark } from '@/data/mock'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const store = useAthleteStore()
const { userDisciplines } = useCurrentUser()

// ─── Disciplinas disponibles ──────────────────────────────────
const availableDiscs = computed(() => {
  const ids = userDisciplines.value.length
    ? userDisciplines.value
    : store.disciplines
  return ids
    .map((id) => getDisciplineConfig(id))
    .filter((d): d is NonNullable<typeof d> => d !== undefined)
})

const activeDisc = ref<string>(availableDiscs.value[0]?.id ?? store.disciplines[0] ?? '')

watch(
  () => availableDiscs.value[0]?.id,
  (val) => { if (val && !activeDisc.value) activeDisc.value = val },
  { immediate: false },
)

const disciplineConfig = computed(() => getDisciplineConfig(activeDisc.value))
const betterIs = computed(() => disciplineConfig.value?.betterIs ?? 'lower')
const resultUnit = computed(() => disciplineConfig.value?.resultUnit ?? 'seconds')

// ─── Marcas filtradas ─────────────────────────────────────────
const sorted = computed(() =>
  store.marks
    .filter((m) => m.discipline === activeDisc.value)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date)),
)

// ─── Estadísticas ─────────────────────────────────────────────
const pb = computed<Mark | null>(() =>
  sorted.value.reduce<Mark | null>(
    (best, m) =>
      !best
        ? m
        : betterIs.value === 'lower'
          ? m.resultValue < best.resultValue ? m : best
          : m.resultValue > best.resultValue ? m : best,
    null,
  ),
)

const average = computed(() => {
  if (!sorted.value.length) return 0
  return sorted.value.reduce((s, m) => s + m.resultValue, 0) / sorted.value.length
})

const wins = computed(() => sorted.value.filter((m) => m.ranking === 1).length)

// ─── Gráfico ──────────────────────────────────────────────────
function pointColor(m: Mark): string {
  return m.isPR ? '#E24B4A' : '#5b5ef4'
}
function pointRadius(m: Mark): number {
  return m.isPR ? 7 : 4
}

const chartData = computed(() => ({
  labels: sorted.value.map((m) =>
    new Date(m.date).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    }),
  ),
  datasets: [
    {
      label: disciplineConfig.value?.resultLabel ?? 'Resultado',
      data: sorted.value.map((m) => m.resultValue),
      borderColor: '#5b5ef4',
      backgroundColor: 'rgba(91,94,244,0.05)',
      borderWidth: 1.5,
      pointBackgroundColor: sorted.value.map(pointColor),
      pointBorderColor: sorted.value.map(pointColor),
      pointRadius: sorted.value.map(pointRadius),
      pointHoverRadius: 9,
      tension: 0.2,
      fill: true,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#ffffff',
      borderColor: 'rgba(0,0,0,0.09)',
      borderWidth: 1,
      titleColor: '#111827',
      bodyColor: '#6b7280',
      padding: 12,
      callbacks: {
        title: (items: TooltipItem<'line'>[]) =>
          sorted.value[items[0]?.dataIndex ?? 0]?.competition ?? '',
        label: (item: TooltipItem<'line'>) => {
          const m = sorted.value[item.dataIndex]!
          const lines = [` ${formatResult(m.resultValue, resultUnit.value)}`]
          if (m.ranking !== null) lines.push(` Posición: ${m.ranking}°`)
          return lines
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        autoSkip: true,
        maxTicksLimit: 18,
        font: { size: 10 },
        color: '#9ca3af',
      },
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
    y: {
      ticks: {
        callback: (v: number | string) => formatResult(Number(v), resultUnit.value),
        font: { size: 11 },
        color: '#9ca3af',
      },
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
  },
}))

// ─── Lista ────────────────────────────────────────────────────
const showAll = ref(false)
const filterYear = ref<string>('todos')

const years = computed(() =>
  [...new Set(sorted.value.map((m) => m.date.slice(0, 4)))].sort().reverse(),
)

watch(activeDisc, () => {
  filterYear.value = 'todos'
  showAll.value = false
})

const displayList = computed(() => {
  const all = [...sorted.value].sort((a, b) => b.date.localeCompare(a.date))
  const filtered =
    filterYear.value === 'todos' ? all : all.filter((m) => m.date.startsWith(filterYear.value))
  return showAll.value ? filtered : filtered.slice(0, 10)
})

const totalFiltered = computed(() => {
  const all = [...sorted.value].sort((a, b) => b.date.localeCompare(a.date))
  return filterYear.value === 'todos'
    ? all.length
    : all.filter((m) => m.date.startsWith(filterYear.value)).length
})

// ─── Formulario ───────────────────────────────────────────────
const showForm = ref(false)
const form = ref({
  date: '',
  resultValue: '',
  discipline: activeDisc.value,
  competition: '',
  ranking: '',
  isPR: false,
})

watch(activeDisc, (val) => { form.value.discipline = val })
watch(showForm, (open) => { if (open) form.value.discipline = activeDisc.value })

function resetForm() {
  form.value = {
    date: '',
    resultValue: '',
    discipline: activeDisc.value,
    competition: '',
    ranking: '',
    isPR: false,
  }
}

function submitMark() {
  const val = parseFloat(form.value.resultValue)
  if (!form.value.date || isNaN(val) || !form.value.competition) return
  const cfg = getDisciplineConfig(form.value.discipline)
  store.addMark({
    date: form.value.date,
    resultValue: val,
    resultUnit: cfg?.resultUnit ?? 'seconds',
    result: formatResult(val, cfg?.resultUnit ?? 'seconds'),
    discipline: form.value.discipline,
    competition: form.value.competition,
    ranking: form.value.ranking ? parseInt(form.value.ranking) : null,
    isPR: form.value.isPR,
  })
  showForm.value = false
  resetForm()
}

function discLabel(id: string) {
  return getDisciplineConfig(id)?.label ?? id
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
  <div class="marcas">
    <!-- Header -->
    <div class="marcas__header">
      <div>
        <h1 class="page-title">Mis Marcas</h1>
        <p class="page-subtitle">{{ discLabel(activeDisc) }} · historial de competencias</p>
      </div>
      <button class="btn-add" @click="showForm = true">
        <AppIcon name="Plus" :size="16" />
        Agregar marca
      </button>
    </div>

    <!-- Tabs por disciplina -->
    <div v-if="availableDiscs.length > 1" class="disc-tabs">
      <button
        v-for="d in availableDiscs"
        :key="d.id"
        class="disc-tab"
        :class="{ 'disc-tab--active': activeDisc === d.id }"
        @click="activeDisc = d.id"
      >
        {{ d.label }}
        <span class="disc-tab__count">
          {{ store.marks.filter((m) => m.discipline === d.id).length }}
        </span>
      </button>
    </div>

    <!-- Estado vacío -->
    <div v-if="sorted.length === 0" class="empty-state">
      <div class="empty-icon">
        <AppIcon name="Target" :size="36" />
      </div>
      <p class="empty-title">Sin marcas en {{ discLabel(activeDisc) }}</p>
      <p class="empty-sub">Agrega tu primera competencia para ver tu progreso.</p>
      <button class="btn-add" style="margin-top: 8px" @click="showForm = true">
        <AppIcon name="Plus" :size="15" />
        Agregar primera marca
      </button>
    </div>

    <template v-else>
      <!-- Stats -->
      <section class="stats-row">
        <div class="stat-pill">
          <span class="stat-pill__value stat-pill__value--pb">
            {{ pb ? formatResult(pb.resultValue, resultUnit) : '—' }}
          </span>
          <span class="stat-pill__label">Récord personal</span>
        </div>
        <div class="stat-pill">
          <span class="stat-pill__value">{{ formatResult(average, resultUnit) }}</span>
          <span class="stat-pill__label">Promedio</span>
        </div>
        <div class="stat-pill">
          <span class="stat-pill__value">{{ wins }}</span>
          <span class="stat-pill__label">Victorias (1°)</span>
        </div>
        <div class="stat-pill">
          <span class="stat-pill__value">{{ sorted.length }}</span>
          <span class="stat-pill__label">Competencias</span>
        </div>
      </section>

      <!-- Gráfico -->
      <section class="chart-section">
        <div class="chart-legend">
          <span class="legend-item">
            <span class="legend-dot" style="background: #5b5ef4" /> Marca
          </span>
          <span class="legend-item">
            <span class="legend-dot" style="background: #e24b4a" /> Récord personal
          </span>
        </div>
        <div class="chart-wrapper">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </section>

      <!-- Lista -->
      <section class="list-section">
        <div class="list-header">
          <h2 class="section-title">Historial</h2>
          <div class="year-filter">
            <button
              v-for="y in ['todos', ...years]"
              :key="y"
              class="year-btn"
              :class="{ 'year-btn--active': filterYear === y }"
              @click="filterYear = y; showAll = false"
            >
              {{ y === 'todos' ? 'Todos' : y }}
            </button>
          </div>
        </div>

        <div class="mark-list">
          <div
            v-for="m in displayList"
            :key="m.id"
            class="mark-row"
            :class="{ 'mark-row--pr': m.isPR }"
          >
            <div class="mark-row__result">
              <span class="mark-result">{{ formatResult(m.resultValue, m.resultUnit) }}</span>
              <span v-if="m.isPR" class="pr-tag">PR</span>
            </div>
            <div class="mark-row__info">
              <p class="mark-comp">{{ m.competition }}</p>
              <p class="mark-meta">{{ formatDate(m.date) }}</p>
            </div>
            <div v-if="m.ranking !== null" class="mark-ranking">{{ m.ranking }}°</div>
          </div>
        </div>

        <button
          v-if="!showAll && totalFiltered > 10"
          class="show-more-btn"
          @click="showAll = true"
        >
          Ver todos ({{ totalFiltered }})
        </button>
      </section>
    </template>

    <!-- Modal: agregar marca -->
    <Teleport to="body">
      <div
        v-if="showForm"
        class="modal-overlay"
        @click.self="showForm = false; resetForm()"
      >
        <div class="modal">
          <div class="modal__header">
            <h2 class="modal__title">Agregar marca</h2>
            <button class="modal__close" @click="showForm = false; resetForm()">
              <AppIcon name="ChevronDown" :size="20" />
            </button>
          </div>

          <form class="modal__form" @submit.prevent="submitMark">
            <!-- Disciplina (si hay varias) -->
            <div v-if="availableDiscs.length > 1" class="form-field">
              <label class="form-label">Disciplina *</label>
              <select v-model="form.discipline" class="form-input">
                <option v-for="d in availableDiscs" :key="d.id" :value="d.id">
                  {{ d.label }}
                </option>
              </select>
            </div>

            <div class="form-row form-row--2">
              <div class="form-field">
                <label class="form-label">Fecha *</label>
                <input v-model="form.date" type="date" class="form-input" required />
              </div>
              <div class="form-field">
                <label class="form-label">
                  {{ disciplineConfig?.resultLabel ?? 'Resultado' }}
                  ({{ resultUnit === 'seconds' ? 's' : 'm' }}) *
                </label>
                <input
                  v-model="form.resultValue"
                  type="number"
                  step="0.01"
                  min="0"
                  :placeholder="resultUnit === 'seconds' ? 'ej: 47.35' : 'ej: 62.35'"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="form-field">
              <label class="form-label">Competencia *</label>
              <input
                v-model="form.competition"
                type="text"
                placeholder="ej: Nacional Absoluto"
                class="form-input"
                required
              />
            </div>

            <div class="form-field">
              <label class="form-label">Posición final</label>
              <input
                v-model="form.ranking"
                type="number"
                min="1"
                placeholder="ej: 1"
                class="form-input"
              />
            </div>

            <label class="form-checkbox">
              <input v-model="form.isPR" type="checkbox" />
              <span>Récord personal (PR)</span>
            </label>

            <div class="form-actions">
              <button
                type="button"
                class="btn-cancel"
                @click="showForm = false; resetForm()"
              >
                Cancelar
              </button>
              <button type="submit" class="btn-submit">
                <AppIcon name="Plus" :size="15" />
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.marcas {
  padding: 24px 16px 100px;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (min-width: 1024px) {
  .marcas { padding: 32px 40px 60px; }
}

/* Header */
.marcas__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.page-title    { font-size: 24px; font-weight: 800; color: var(--color-heading); }
.page-subtitle { font-size: 14px; color: var(--color-text-muted); margin-top: 2px; }

.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--accent-primary);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
  white-space: nowrap;
}
.btn-add:hover { opacity: 0.88; }

/* Tabs de disciplina */
.disc-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.disc-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.disc-tab--active {
  background: var(--accent-primary);
  color: #fff;
  border-color: var(--accent-primary);
}
.disc-tab:not(.disc-tab--active):hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}
.disc-tab__count {
  font-size: 11px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  padding: 1px 6px;
}
.disc-tab:not(.disc-tab--active) .disc-tab__count {
  background: var(--glass-bg);
  color: var(--color-text-muted);
}

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 60px 24px;
  background: var(--glass-bg);
  border: 1px dashed var(--glass-border);
  border-radius: 20px;
}
.empty-icon  { color: var(--accent-primary); opacity: 0.4; margin-bottom: 4px; }
.empty-title { font-size: 18px; font-weight: 700; color: var(--color-heading); }
.empty-sub   { font-size: 14px; color: var(--color-text-muted); max-width: 340px; line-height: 1.6; }

/* Stats */
.stats-row { display: flex; gap: 10px; flex-wrap: wrap; }
.stat-pill {
  flex: 1;
  min-width: 88px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 14px 12px;
  text-align: center;
  box-shadow: var(--card-shadow);
}
.stat-pill__value {
  display: block;
  font-size: 19px;
  font-weight: 800;
  color: var(--accent-primary);
  line-height: 1.1;
}
.stat-pill__value--pb { color: #e24b4a; }
.stat-pill__label { display: block; font-size: 10px; color: var(--color-text-muted); margin-top: 4px; }

/* Chart */
.chart-legend {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.chart-wrapper {
  position: relative;
  height: 300px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--card-shadow);
}

/* Lista */
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.year-filter { display: flex; gap: 6px; flex-wrap: wrap; }
.year-btn {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.year-btn--active,
.year-btn:hover {
  background: var(--accent-primary);
  color: #fff;
  border-color: var(--accent-primary);
}

.mark-list { display: flex; flex-direction: column; gap: 8px; }
.mark-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px 14px;
  transition: border-color 0.15s;
}
.mark-row--pr { border-color: rgba(226, 75, 74, 0.3); background: rgba(226, 75, 74, 0.03); }
.mark-row:hover { border-color: rgba(91, 94, 244, 0.3); }

.mark-row__result {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  min-width: 90px;
}
.mark-result { font-size: 16px; font-weight: 800; color: var(--color-heading); }
.pr-tag {
  font-size: 9px;
  font-weight: 900;
  background: #e24b4a;
  color: #fff;
  padding: 2px 5px;
  border-radius: 4px;
}

.mark-row__info { flex: 1; min-width: 0; }
.mark-comp {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-heading);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mark-meta { font-size: 11px; color: var(--color-text-muted); }
.mark-ranking { font-size: 13px; font-weight: 700; color: var(--color-text-muted); flex-shrink: 0; }

.show-more-btn {
  align-self: center;
  background: none;
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-primary);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  margin-top: 4px;
}
.show-more-btn:hover { background: var(--glass-bg); }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}
@media (min-width: 640px) {
  .modal-overlay { align-items: center; padding: 24px; }
}
.modal {
  background: var(--color-background);
  border: 1px solid var(--glass-border);
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 32px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.12);
}
@media (min-width: 640px) {
  .modal { border-radius: 20px; box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18); }
}
.modal__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.modal__title  { font-size: 18px; font-weight: 800; color: var(--color-heading); }
.modal__close  { background: none; border: none; color: var(--color-text-muted); cursor: pointer; padding: 4px; }

.modal__form { display: flex; flex-direction: column; gap: 14px; }
.form-row    { display: grid; gap: 12px; }
.form-row--2 { grid-template-columns: 1fr 1fr; }
.form-field  { display: flex; flex-direction: column; gap: 4px; }
.form-label  { font-size: 12px; font-weight: 600; color: var(--color-text-muted); }
.form-input {
  padding: 10px 12px;
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  background: var(--glass-bg);
  font-size: 14px;
  color: var(--color-heading);
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.form-input:focus { border-color: var(--accent-primary); }

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-heading);
  cursor: pointer;
}
.form-checkbox input { accent-color: var(--accent-primary); width: 16px; height: 16px; }

.form-actions { display: flex; gap: 10px; margin-top: 4px; }
.btn-cancel {
  flex: 1;
  padding: 12px;
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  background: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.btn-cancel:hover { border-color: var(--color-heading); color: var(--color-heading); }
.btn-submit {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: var(--accent-primary);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}
.btn-submit:hover { opacity: 0.88; }
</style>
