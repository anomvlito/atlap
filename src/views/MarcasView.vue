<script setup lang="ts">
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Tooltip, Filler,
  type TooltipItem
} from 'chart.js'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAthleteStore } from '@/stores/athlete'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { getDisciplineConfig, getDisciplinesForGroup } from '@/types/discipline'
import type { Throw, ThrowSource } from '@/data/mock'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const store = useAthleteStore()
const { dbUser, userDisciplines } = useCurrentUser()

// ─── Disciplinas disponibles (solo lanzamiento) ───────────────
const throwingDisciplines = computed(() => {
  // Disciplinas del usuario que sean del grupo lanzamiento
  const userThrowDiscs = userDisciplines.value.filter(
    d => getDisciplineConfig(d)?.group === 'lanzamiento'
  )
  // Si el usuario no tiene ninguna configurada, mostramos todas las de lanzamiento
  if (!userThrowDiscs.length) {
    return getDisciplinesForGroup('lanzamiento')
  }
  return userThrowDiscs
    .map(id => getDisciplineConfig(id))
    .filter((d): d is NonNullable<typeof d> => d !== undefined)
})

// Tab activo — primera disciplina del usuario
const activeDisc = ref<string>(
  throwingDisciplines.value[0]?.id ?? 'disco'
)

// Sincronizar activeDisc cuando las disciplinas cambian
const firstDiscId = computed(() => throwingDisciplines.value[0]?.id ?? 'disco')
import { watch } from 'vue'
watch(firstDiscId, (val) => { activeDisc.value = val }, { immediate: false })

// ─── Lucas Nervi: botón de importar ──────────────────────────
const isLucasNervi = computed(() => {
  const name = (dbUser.value?.fullName ?? '').toLowerCase().trim()
  return name === 'lucas nervi'
})

const alreadyImported = computed(() =>
  store.throws.some(t => t.id.startsWith('t') && t.discipline === 'disco' && t.source === 'local')
)

function handleImport() {
  store.importLucasNervi()
  activeDisc.value = 'disco'
}

// ─── Throws filtrados por disciplina activa ───────────────────
const sorted = computed(() =>
  store.throws
    .filter(t => t.discipline === activeDisc.value)
    .sort((a, b) => a.date.localeCompare(b.date))
)

// ─── Estadísticas ────────────────────────────────────────────
const pb = computed(() =>
  sorted.value.reduce<Throw | null>((best, t) => (!best || t.mark > best.mark ? t : best), null)
)
const avg = computed(() => {
  if (!sorted.value.length) return 0
  return sorted.value.reduce((s, t) => s + t.mark, 0) / sorted.value.length
})
const wins  = computed(() => sorted.value.filter(t => t.place === 1).length)
const intl  = computed(() => sorted.value.filter(t => t.source === 'international').length)

// ─── Colores de puntos ────────────────────────────────────────
function pointColor(t: Throw): string {
  if (t.pb)                         return '#E24B4A'
  if (t.source === 'international') return '#EF9F27'
  return '#5b5ef4'
}
function pointRadius(t: Throw): number {
  return t.source === 'international' || t.pb ? 7 : 4
}

// ─── Gráfico ─────────────────────────────────────────────────
const chartData = computed(() => ({
  labels: sorted.value.map(t =>
    new Date(t.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: '2-digit' })
  ),
  datasets: [{
    label: 'Distancia (m)',
    data: sorted.value.map(t => t.mark),
    borderColor: '#5b5ef4',
    backgroundColor: 'rgba(91,94,244,0.05)',
    borderWidth: 1.5,
    pointBackgroundColor: sorted.value.map(pointColor),
    pointBorderColor: sorted.value.map(pointColor),
    pointRadius: sorted.value.map(pointRadius),
    pointHoverRadius: 9,
    tension: 0.2,
    fill: true,
  }]
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
        title: (items: TooltipItem<'line'>[]) => sorted.value[items[0]?.dataIndex ?? 0]?.competition ?? '',
        label: (item: TooltipItem<'line'>) => {
          const t = sorted.value[item.dataIndex]!
          const lines = [` ${item.raw} m — ${t.location}`]
          if (t.place !== undefined) lines.push(` Posición: ${t.place}°`)
          return lines
        },
      }
    }
  },
  scales: {
    x: {
      ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 18, font: { size: 10 }, color: '#9ca3af' },
      grid: { color: 'rgba(0,0,0,0.05)' }
    },
    y: {
      ticks: { callback: (v: number | string) => `${v} m`, font: { size: 11 }, color: '#9ca3af' },
      grid: { color: 'rgba(0,0,0,0.05)' }
    }
  }
}))

// ─── Lista ───────────────────────────────────────────────────
const showAll      = ref(false)
const filterYear   = ref<string>('todos')

const years = computed(() => {
  const ys = [...new Set(
    store.throws
      .filter(t => t.discipline === activeDisc.value)
      .map(t => t.date.slice(0, 4))
  )].sort().reverse()
  return ys
})

watch(activeDisc, () => {
  filterYear.value = 'todos'
  showAll.value = false
})

const displayList = computed(() => {
  const all = store.throws
    .filter(t => t.discipline === activeDisc.value)
    .sort((a, b) => b.date.localeCompare(a.date))
  const filtered = filterYear.value === 'todos'
    ? all
    : all.filter(t => t.date.startsWith(filterYear.value))
  return showAll.value ? filtered : filtered.slice(0, 10)
})

const totalFiltered = computed(() => {
  const all = store.throws.filter(t => t.discipline === activeDisc.value)
  return filterYear.value === 'todos'
    ? all.length
    : all.filter(t => t.date.startsWith(filterYear.value)).length
})

// ─── Formulario ──────────────────────────────────────────────
const showForm = ref(false)
const form = ref({
  date: '',
  mark: '',
  discipline: activeDisc.value,
  competition: '',
  location: '',
  source: 'local' as ThrowSource,
  place: '',
  pb: false,
})

watch(activeDisc, (val) => { form.value.discipline = val })
watch(showForm, (open) => { if (open) form.value.discipline = activeDisc.value })

function resetForm() {
  form.value = { date: '', mark: '', discipline: activeDisc.value, competition: '', location: '', source: 'local', place: '', pb: false }
}

function submitThrow() {
  const markVal = parseFloat(form.value.mark)
  if (!form.value.date || isNaN(markVal) || !form.value.competition) return
  store.addThrow({
    date: form.value.date,
    mark: markVal,
    discipline: form.value.discipline,
    competition: form.value.competition,
    location: form.value.location,
    source: form.value.source,
    place: form.value.place ? parseInt(form.value.place) : undefined,
    pb: form.value.pb,
  })
  showForm.value = false
  resetForm()
}

// ─── Helpers ─────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}
function sourceBadgeClass(source: ThrowSource) {
  return source === 'international' ? 'badge--intl' : 'badge--local'
}
function sourceBadgeLabel(source: ThrowSource) {
  return source === 'international' ? 'Internacional' : 'Local'
}
function discLabel(id: string) {
  return getDisciplineConfig(id)?.label ?? id
}
</script>

<template>
  <div class="marcas">
    <!-- Header -->
    <div class="marcas__header">
      <div>
        <h1 class="page-title">Mis Marcas</h1>
        <p class="page-subtitle">Lanzamientos · {{ discLabel(activeDisc) }}</p>
      </div>
      <div class="header-actions">
        <!-- Botón de importar — solo visible para Lucas Nervi -->
        <button
          v-if="isLucasNervi && !alreadyImported"
          class="btn-import"
          @click="handleImport"
        >
          <AppIcon name="ArrowRight" :size="14" />
          Importar mis datos
        </button>
        <button class="btn-add" @click="showForm = true">
          <AppIcon name="Plus" :size="16" />
          Agregar marca
        </button>
      </div>
    </div>

    <!-- Tabs por disciplina -->
    <div v-if="throwingDisciplines.length > 1" class="disc-tabs">
      <button
        v-for="d in throwingDisciplines"
        :key="d.id"
        class="disc-tab"
        :class="{ 'disc-tab--active': activeDisc === d.id }"
        @click="activeDisc = d.id"
      >
        {{ d.label }}
        <span class="disc-tab__count">
          {{ store.throws.filter(t => t.discipline === d.id).length }}
        </span>
      </button>
    </div>

    <!-- Estado vacío -->
    <div v-if="sorted.length === 0" class="empty-state">
      <div class="empty-icon">
        <AppIcon name="Target" :size="36" />
      </div>
      <p class="empty-title">Sin marcas en {{ discLabel(activeDisc) }}</p>
      <p class="empty-sub">
        Agrega tu primera marca o, si eres Lucas Nervi, importa tu historial completo.
      </p>
      <button class="btn-add" style="margin-top:8px" @click="showForm = true">
        <AppIcon name="Plus" :size="15" />
        Agregar primera marca
      </button>
    </div>

    <template v-else>
      <!-- Stats -->
      <section class="stats-row">
        <div class="stat-pill">
          <span class="stat-pill__value stat-pill__value--pb">{{ pb?.mark?.toFixed(2) ?? '—' }} m</span>
          <span class="stat-pill__label">Récord personal</span>
        </div>
        <div class="stat-pill">
          <span class="stat-pill__value">{{ avg.toFixed(2) }} m</span>
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
        <div class="stat-pill">
          <span class="stat-pill__value">{{ intl }}</span>
          <span class="stat-pill__label">Internacionales</span>
        </div>
      </section>

      <!-- Gráfico -->
      <section class="chart-section">
        <div class="chart-legend">
          <span class="legend-item">
            <span class="legend-dot" style="background:#5b5ef4"></span> Local
          </span>
          <span class="legend-item">
            <span class="legend-dot" style="background:#EF9F27"></span> Internacional
          </span>
          <span class="legend-item">
            <span class="legend-dot" style="background:#E24B4A"></span> Récord personal
          </span>
        </div>
        <div class="chart-wrapper">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </section>

      <!-- Lista -->
      <section class="list-section">
        <div class="list-header">
          <h2 class="section-title">Todos los lanzamientos</h2>
          <div class="year-filter">
            <button
              v-for="y in ['todos', ...years]"
              :key="y"
              class="year-btn"
              :class="{ 'year-btn--active': filterYear === y }"
              @click="filterYear = y; showAll = false"
            >{{ y === 'todos' ? 'Todos' : y }}</button>
          </div>
        </div>

        <div class="throw-list">
          <div
            v-for="t in displayList"
            :key="t.id"
            class="throw-row"
            :class="{ 'throw-row--pb': t.pb }"
          >
            <div class="throw-row__mark">
              <span class="throw-mark">{{ t.mark.toFixed(2) }} m</span>
              <span v-if="t.pb" class="pb-tag">PR</span>
            </div>
            <div class="throw-row__info">
              <p class="throw-comp">{{ t.competition }}</p>
              <p class="throw-meta">{{ formatDate(t.date) }} · {{ t.location }}</p>
            </div>
            <div class="throw-row__right">
              <span class="badge" :class="sourceBadgeClass(t.source)">{{ sourceBadgeLabel(t.source) }}</span>
              <span v-if="t.place !== undefined" class="throw-place">{{ t.place }}°</span>
            </div>
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
      <div v-if="showForm" class="modal-overlay" @click.self="showForm = false; resetForm()">
        <div class="modal">
          <div class="modal__header">
            <h2 class="modal__title">Agregar lanzamiento</h2>
            <button class="modal__close" @click="showForm = false; resetForm()">
              <AppIcon name="ChevronDown" :size="20" />
            </button>
          </div>

          <form class="modal__form" @submit.prevent="submitThrow">
            <!-- Disciplina (si el usuario tiene varias) -->
            <div v-if="throwingDisciplines.length > 1" class="form-field">
              <label class="form-label">Disciplina *</label>
              <select v-model="form.discipline" class="form-input">
                <option
                  v-for="d in throwingDisciplines"
                  :key="d.id"
                  :value="d.id"
                >{{ d.label }}</option>
              </select>
            </div>

            <div class="form-row form-row--2">
              <div class="form-field">
                <label class="form-label">Fecha *</label>
                <input v-model="form.date" type="date" class="form-input" required />
              </div>
              <div class="form-field">
                <label class="form-label">Distancia (m) *</label>
                <input
                  v-model="form.mark"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ej: 62.35"
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
                placeholder="ej: Meeting UC Apertura"
                class="form-input"
                required
              />
            </div>

            <div class="form-field">
              <label class="form-label">Lugar</label>
              <input
                v-model="form.location"
                type="text"
                placeholder="ej: San Carlos de Apoquindo, Santiago"
                class="form-input"
              />
            </div>

            <div class="form-row form-row--2">
              <div class="form-field">
                <label class="form-label">Tipo</label>
                <select v-model="form.source" class="form-input">
                  <option value="local">Local / Nacional</option>
                  <option value="international">Internacional</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Posición final</label>
                <input
                  v-model="form.place"
                  type="number"
                  min="1"
                  placeholder="ej: 1"
                  class="form-input"
                />
              </div>
            </div>

            <label class="form-checkbox">
              <input v-model="form.pb" type="checkbox" />
              <span>Récord personal (PR)</span>
            </label>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="showForm = false; resetForm()">
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
@media (min-width: 1024px) { .marcas { padding: 32px 40px 60px; } }

/* Header */
.marcas__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.page-title  { font-size: 24px; font-weight: 800; color: var(--color-heading); }
.page-subtitle { font-size: 14px; color: var(--color-text-muted); margin-top: 2px; }

.header-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

.btn-import {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(91,94,244,0.08);
  color: var(--accent-primary);
  border: 1px solid rgba(91,94,244,0.25);
  border-radius: 12px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-import:hover { background: rgba(91,94,244,0.14); }

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
.disc-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
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
  background: rgba(255,255,255,0.25);
  border-radius: 6px;
  padding: 1px 6px;
}
.disc-tab:not(.disc-tab--active) .disc-tab__count {
  background: var(--glass-bg);
  color: var(--color-text-muted);
}

/* Empty state */
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
.empty-icon { color: var(--accent-primary); opacity: 0.4; margin-bottom: 4px; }
.empty-title { font-size: 18px; font-weight: 700; color: var(--color-heading); }
.empty-sub { font-size: 14px; color: var(--color-text-muted); max-width: 340px; line-height: 1.6; }

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
.stat-pill__value--pb { color: #E24B4A; }
.stat-pill__label { display: block; font-size: 10px; color: var(--color-text-muted); margin-top: 4px; }

/* Chart */
.chart-legend { display: flex; gap: 18px; flex-wrap: wrap; margin-bottom: 12px; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-muted); }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
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
.section-title { font-size: 13px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.07em; }
.list-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
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
.year-btn--active, .year-btn:hover { background: var(--accent-primary); color: #fff; border-color: var(--accent-primary); }

.throw-list { display: flex; flex-direction: column; gap: 8px; }
.throw-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px 14px;
  transition: border-color 0.15s;
}
.throw-row--pb { border-color: rgba(226,75,74,0.3); background: rgba(226,75,74,0.03); }
.throw-row:hover { border-color: rgba(91,94,244,0.3); }

.throw-row__mark { display: flex; align-items: center; gap: 6px; flex-shrink: 0; min-width: 90px; }
.throw-mark { font-size: 16px; font-weight: 800; color: var(--color-heading); }
.pb-tag { font-size: 9px; font-weight: 900; background: #E24B4A; color: #fff; padding: 2px 5px; border-radius: 4px; }

.throw-row__info { flex: 1; min-width: 0; }
.throw-comp { font-size: 13px; font-weight: 600; color: var(--color-heading); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.throw-meta { font-size: 11px; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.throw-row__right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 8px; }
.badge--local { background: rgba(91,94,244,0.1); color: var(--accent-primary); }
.badge--intl  { background: rgba(239,159,39,0.12); color: #d48806; }
.throw-place  { font-size: 12px; font-weight: 700; color: var(--color-text-muted); }

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
  background: rgba(0,0,0,0.3);
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
  box-shadow: 0 -4px 32px rgba(0,0,0,0.12);
}
@media (min-width: 640px) {
  .modal { border-radius: 20px; box-shadow: 0 8px 40px rgba(0,0,0,0.18); }
}
.modal__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.modal__title  { font-size: 18px; font-weight: 800; color: var(--color-heading); }
.modal__close  { background: none; border: none; color: var(--color-text-muted); cursor: pointer; padding: 4px; }

.modal__form { display: flex; flex-direction: column; gap: 14px; }
.form-row    { display: grid; gap: 12px; }
.form-row--2 { grid-template-columns: 1fr 1fr; }
.form-field  { display: flex; flex-direction: column; gap: 4px; }
.form-label  { font-size: 12px; font-weight: 600; color: var(--color-text-muted); }
.form-input  {
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
