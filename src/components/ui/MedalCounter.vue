<script setup lang="ts">
import { ref, computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { useAthleteStore } from '@/stores/athlete'

const store = useAthleteStore()
const expandedYear = ref<string | null>(null)

const sortedYears = computed(() =>
  Object.keys(store.medalsByYear).sort((a, b) => Number(b) - Number(a))
)

function toggleYear(year: string) {
  expandedYear.value = expandedYear.value === year ? null : year
}
</script>

<template>
  <div class="medal-counter">
    <!-- Totales -->
    <div class="medal-counter__totals">
      <div class="medal-item medal-item--gold">
        <AppIcon name="Trophy" :size="22" />
        <span class="medal-item__count">{{ store.medals.gold }}</span>
        <span class="medal-item__label">Oro</span>
      </div>
      <div class="medal-divider" />
      <div class="medal-item medal-item--silver">
        <AppIcon name="Trophy" :size="22" />
        <span class="medal-item__count">{{ store.medals.silver }}</span>
        <span class="medal-item__label">Plata</span>
      </div>
      <div class="medal-divider" />
      <div class="medal-item medal-item--bronze">
        <AppIcon name="Trophy" :size="22" />
        <span class="medal-item__count">{{ store.medals.bronze }}</span>
        <span class="medal-item__label">Bronce</span>
      </div>
      <div class="medal-divider" />
      <div class="medal-item medal-item--total">
        <AppIcon name="Award" :size="22" />
        <span class="medal-item__count">{{ store.medals.total }}</span>
        <span class="medal-item__label">Total</span>
      </div>
    </div>

    <!-- Desglose por año -->
    <div class="medal-counter__years">
      <h3 class="years-title">Historial por año</h3>
      <div
        v-for="year in sortedYears"
        :key="year"
        class="year-row"
      >
        <button class="year-row__header" @click="toggleYear(year)">
          <span class="year-row__year">{{ year }}</span>
          <div class="year-row__summary">
            <span v-if="store.medalsByYear[year]!.gold > 0" class="year-chip year-chip--gold">
              {{ store.medalsByYear[year]!.gold }} oro
            </span>
            <span v-if="store.medalsByYear[year]!.silver > 0" class="year-chip year-chip--silver">
              {{ store.medalsByYear[year]!.silver }} plata
            </span>
            <span v-if="store.medalsByYear[year]!.bronze > 0" class="year-chip year-chip--bronze">
              {{ store.medalsByYear[year]!.bronze }} bronce
            </span>
          </div>
          <AppIcon
            :name="expandedYear === year ? 'ChevronUp' : 'ChevronDown'"
            :size="16"
            class="year-row__chevron"
          />
        </button>
        <div v-show="expandedYear === year" class="year-row__detail">
          <div class="year-detail-grid">
            <div v-if="store.medalsByYear[year]!.gold > 0" class="year-detail-item year-detail-item--gold">
              <AppIcon name="Trophy" :size="16" />
              <span>{{ store.medalsByYear[year]!.gold }} primera{{ store.medalsByYear[year]!.gold > 1 ? 's' : '' }} plaza</span>
            </div>
            <div v-if="store.medalsByYear[year]!.silver > 0" class="year-detail-item year-detail-item--silver">
              <AppIcon name="Trophy" :size="16" />
              <span>{{ store.medalsByYear[year]!.silver }} segunda{{ store.medalsByYear[year]!.silver > 1 ? 's' : '' }} plaza</span>
            </div>
            <div v-if="store.medalsByYear[year]!.bronze > 0" class="year-detail-item year-detail-item--bronze">
              <AppIcon name="Trophy" :size="16" />
              <span>{{ store.medalsByYear[year]!.bronze }} tercera{{ store.medalsByYear[year]!.bronze > 1 ? 's' : '' }} plaza</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.medal-counter {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.medal-counter__totals {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20px 16px;
  border-bottom: 1px solid var(--glass-border);
}

.medal-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.medal-item--gold { color: #FFD700; }
.medal-item--silver { color: #C0C0C0; }
.medal-item--bronze { color: #CD7F32; }
.medal-item--total { color: var(--accent-primary); }

.medal-item__count {
  font-size: 28px;
  font-weight: var(--font-weight-display);
  line-height: 1;
}

.medal-item__label {
  font-size: 11px;
  color: var(--vt-c-text-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.medal-divider {
  width: 1px;
  height: 48px;
  background: var(--glass-border);
}

.medal-counter__years {
  padding: 16px;
}

.years-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--vt-c-text-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 10px;
}

.year-row {
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 4px;
}

.year-row__header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-heading);
  border-radius: 10px;
  transition: background 0.15s;
}

.year-row__header:hover {
  background: rgba(255, 255, 255, 0.04);
}

.year-row__year {
  font-size: 14px;
  font-weight: 700;
  min-width: 40px;
}

.year-row__summary {
  display: flex;
  gap: 6px;
  flex: 1;
  flex-wrap: wrap;
}

.year-chip {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
}

.year-chip--gold { color: #FFD700; background: rgba(255, 215, 0, 0.1); }
.year-chip--silver { color: #C0C0C0; background: rgba(192, 192, 192, 0.1); }
.year-chip--bronze { color: #CD7F32; background: rgba(205, 127, 50, 0.1); }

.year-row__chevron {
  color: var(--vt-c-text-dark-2);
  flex-shrink: 0;
}

.year-row__detail {
  padding: 8px 12px 12px;
}

.year-detail-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.year-detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
}

.year-detail-item--gold { color: #FFD700; }
.year-detail-item--silver { color: #C0C0C0; }
.year-detail-item--bronze { color: #CD7F32; }
</style>
