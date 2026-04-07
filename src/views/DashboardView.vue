<script setup lang="ts">
import { computed } from 'vue'
import { useAthleteStore } from '@/stores/athlete'
import { useCurrentUser } from '@/composables/useCurrentUser'
import AppIcon from '@/components/ui/AppIcon.vue'
import PositiveInsights from '@/components/ui/PositiveInsights.vue'

const store = useAthleteStore()
const { dbUser } = useCurrentUser()

const firstName = computed(() => {
  const name = dbUser.value?.fullName ?? store.athlete.name
  return name.split(' ')[0] ?? name
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
})

const today = computed(() =>
  new Date().toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
)

const totalSessions = computed(() => store.sessions.length)
const totalMarks    = computed(() => store.marks.length)
const totalWins     = computed(() => store.medals.gold)
const streak        = computed(() => store.streakDays)

const nextComp = computed(() => store.nextCompetition)
const daysUntil = computed(() => {
  const diff = new Date(nextComp.value.date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})
const hasUpcomingComp = computed(() => daysUntil.value > 0)

const recentMarks    = computed(() => store.recentMarks.slice(0, 4))
const recentSessions = computed(() => store.recentSessions.slice(0, 3))

const sessionTypeLabel: Record<string, string> = {
  velocidad: 'Velocidad',
  fondo:     'Fondo',
  tecnica:   'Técnica',
  fuerza:    'Fuerza',
}

const sessionTypeColor: Record<string, string> = {
  velocidad: '#E24B4A',
  fondo:     '#5b5ef4',
  tecnica:   '#EF9F27',
  fuerza:    '#22c55e',
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short'
  })
}
</script>

<template>
  <div class="dashboard">

    <!-- Greeting -->
    <section class="dash-header">
      <div>
        <p class="dash-date">{{ today }}</p>
        <h1 class="dash-greeting">{{ greeting }}, {{ firstName }}</h1>
      </div>
      <div class="streak-badge">
        <AppIcon name="Zap" :size="16" />
        <span>{{ streak }} días</span>
      </div>
    </section>

    <!-- Refuerzo positivo -->
    <PositiveInsights />

    <!-- KPIs -->
    <section class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--blue">
          <AppIcon name="Activity" :size="18" />
        </div>
        <span class="kpi-value">{{ totalSessions }}</span>
        <span class="kpi-label">Entrenamientos</span>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--purple">
          <AppIcon name="Target" :size="18" />
        </div>
        <span class="kpi-value">{{ totalMarks }}</span>
        <span class="kpi-label">Competencias</span>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--gold">
          <AppIcon name="Award" :size="18" />
        </div>
        <span class="kpi-value">{{ totalWins }}</span>
        <span class="kpi-label">Victorias</span>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--green">
          <AppIcon name="TrendingUp" :size="18" />
        </div>
        <span class="kpi-value">{{ store.medals.total }}</span>
        <span class="kpi-label">Medallas</span>
      </div>
    </section>

    <!-- Próxima competencia -->
    <section v-if="hasUpcomingComp" class="next-comp">
      <div class="next-comp__left">
        <p class="section-label">Próxima competencia</p>
        <h2 class="next-comp__name">{{ nextComp.name }}</h2>
        <p class="next-comp__meta">
          <AppIcon name="MapPin" :size="12" />
          {{ nextComp.location }}
        </p>
      </div>
      <div class="next-comp__countdown">
        <span class="countdown-num">{{ daysUntil }}</span>
        <span class="countdown-label">días</span>
      </div>
    </section>

    <!-- Últimas marcas -->
    <section class="list-section">
      <h2 class="section-label">Últimas marcas</h2>
      <div v-if="recentMarks.length === 0" class="empty-state">
        <AppIcon name="Target" :size="28" class="empty-state__icon" />
        <p>Aún no hay marcas registradas</p>
      </div>
      <div v-else class="mark-list">
        <div
          v-for="m in recentMarks"
          :key="m.id"
          class="mark-row"
          :class="{ 'mark-row--pr': m.isPR }"
        >
          <div class="mark-row__left">
            <span class="mark-result">{{ m.result }}</span>
            <span v-if="m.isPR" class="pr-tag">PR</span>
          </div>
          <div class="mark-row__center">
            <p class="mark-comp">{{ m.competition }}</p>
            <p class="mark-meta">{{ m.discipline }} · {{ formatDate(m.date) }}</p>
          </div>
          <div v-if="m.ranking" class="mark-ranking">{{ m.ranking }}°</div>
        </div>
      </div>
    </section>

    <!-- Últimos entrenamientos -->
    <section class="list-section">
      <h2 class="section-label">Últimos entrenamientos</h2>
      <div v-if="recentSessions.length === 0" class="empty-state">
        <AppIcon name="Activity" :size="28" class="empty-state__icon" />
        <p>Aún no hay entrenamientos registrados</p>
      </div>
      <div v-else class="session-list">
        <div v-for="s in recentSessions" :key="s.id" class="session-row">
          <div
            class="session-type-dot"
            :style="{ background: sessionTypeColor[s.type] }"
          ></div>
          <div class="session-row__info">
            <p class="session-type">{{ sessionTypeLabel[s.type] }}</p>
            <p class="session-meta">{{ s.durationMin }} min · {{ s.distanceKm }} km · {{ formatDate(s.date) }}</p>
          </div>
          <div class="session-feeling">
            <span
              v-for="i in 5"
              :key="i"
              class="feeling-dot"
              :class="{ 'feeling-dot--on': i <= s.feeling }"
            ></span>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.dashboard {
  padding: 24px 16px 100px;
  max-width: 780px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
@media (min-width: 1024px) { .dashboard { padding: 32px 40px 60px; } }

/* Header */
.dash-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.dash-date {
  font-size: 13px;
  color: var(--color-text-muted);
  text-transform: capitalize;
  margin-bottom: 2px;
}
.dash-greeting {
  font-size: 26px;
  font-weight: 800;
  color: var(--color-heading);
  line-height: 1.1;
}
.streak-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(239, 159, 39, 0.12);
  color: #d48806;
  border: 1px solid rgba(239, 159, 39, 0.25);
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

/* KPIs */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
@media (max-width: 480px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
.kpi-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: var(--card-shadow);
  text-align: center;
}
.kpi-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi-icon--blue   { background: rgba(91, 94, 244, 0.1);  color: #5b5ef4; }
.kpi-icon--purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.kpi-icon--gold   { background: rgba(239, 159, 39, 0.1); color: #d48806; }
.kpi-icon--green  { background: rgba(34, 197, 94, 0.1);  color: #16a34a; }
.kpi-value {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-heading);
  line-height: 1;
}
.kpi-label {
  font-size: 10px;
  color: var(--color-text-muted);
  font-weight: 600;
}

/* Next competition */
.next-comp {
  background: linear-gradient(135deg, rgba(91,94,244,0.08) 0%, rgba(91,94,244,0.03) 100%);
  border: 1px solid rgba(91,94,244,0.2);
  border-radius: 18px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: var(--card-shadow);
}
.section-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 4px;
}
.next-comp__name {
  font-size: 17px;
  font-weight: 800;
  color: var(--color-heading);
  line-height: 1.2;
  margin-bottom: 6px;
}
.next-comp__meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
}
.next-comp__countdown {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  background: var(--accent-primary);
  border-radius: 14px;
  padding: 12px 16px;
  min-width: 60px;
}
.countdown-num {
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  line-height: 1;
}
.countdown-label {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.75);
  margin-top: 2px;
}

/* Lists */
.list-section { display: flex; flex-direction: column; gap: 10px; }

/* Marks */
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
.mark-row--pr { border-color: rgba(226,75,74,0.3); background: rgba(226,75,74,0.03); }
.mark-row:hover { border-color: rgba(91,94,244,0.3); }
.mark-row__left { display: flex; align-items: center; gap: 6px; min-width: 80px; }
.mark-result { font-size: 16px; font-weight: 800; color: var(--color-heading); }
.pr-tag { font-size: 9px; font-weight: 900; background: #E24B4A; color: #fff; padding: 2px 5px; border-radius: 4px; }
.mark-row__center { flex: 1; min-width: 0; }
.mark-comp { font-size: 13px; font-weight: 600; color: var(--color-heading); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mark-meta { font-size: 11px; color: var(--color-text-muted); }
.mark-ranking { font-size: 13px; font-weight: 700; color: var(--color-text-muted); flex-shrink: 0; }

/* Sessions */
.session-list { display: flex; flex-direction: column; gap: 8px; }
.session-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px 14px;
}
.session-type-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.session-row__info { flex: 1; }
.session-type { font-size: 13px; font-weight: 700; color: var(--color-heading); }
.session-meta { font-size: 11px; color: var(--color-text-muted); }
.session-feeling {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}
.feeling-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--glass-border);
}
.feeling-dot--on { background: var(--accent-primary); }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--color-text-muted);
  font-size: 13px;
  text-align: center;
}
.empty-state__icon { opacity: 0.35; }
</style>
