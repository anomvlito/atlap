<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useInsights } from '@/services/insights'

const { insights } = useInsights()

// Carrusel simple: muestra de a 1 en mobile, navega con botones
const current = ref(0)
function prev() {
  current.value = current.value === 0 ? insights.value.length - 1 : current.value - 1
}
function next() {
  current.value = (current.value + 1) % insights.value.length
}

const iconColor: Record<string, string> = {
  TrendingUp: '#5b5ef4',
  Award:      '#d48806',
  Zap:        '#EF9F27',
  Flag:       '#10b981',
  Activity:   '#5b5ef4',
  Heart:      '#f43f5e',
  Trophy:     '#d48806',
}
</script>

<template>
  <section v-if="insights.length" class="insights-section">
    <h2 class="insights-title">
      <AppIcon name="Sparkles" :size="14" />
      Lo que lograste
    </h2>

    <!-- Lista completa en desktop -->
    <div class="insights-list">
      <div
        v-for="(insight, i) in insights"
        :key="i"
        class="insight-card"
      >
        <div
          class="insight-icon"
          :style="{ color: iconColor[insight.icon] ?? '#5b5ef4',
                    background: (iconColor[insight.icon] ?? '#5b5ef4') + '18' }"
        >
          <AppIcon :name="insight.icon" :size="16" />
        </div>
        <div class="insight-body">
          <p class="insight-text">{{ insight.text }}</p>
          <span class="insight-value">{{ insight.value }}</span>
        </div>
      </div>
    </div>

    <!-- Carrusel en mobile -->
    <div class="insights-carousel">
      <div class="insight-card insight-card--featured">
        <div
          class="insight-icon"
          :style="{ color: iconColor[insights[current]!.icon] ?? '#5b5ef4',
                    background: (iconColor[insights[current]!.icon] ?? '#5b5ef4') + '18' }"
        >
          <AppIcon :name="insights[current]!.icon" :size="18" />
        </div>
        <div class="insight-body">
          <p class="insight-text">{{ insights[current]!.text }}</p>
          <span class="insight-value">{{ insights[current]!.value }}</span>
        </div>
      </div>

      <div class="carousel-controls">
        <button class="carousel-btn" @click="prev" aria-label="Anterior">
          <AppIcon name="ChevronLeft" :size="16" />
        </button>
        <div class="carousel-dots">
          <span
            v-for="(_, i) in insights"
            :key="i"
            class="carousel-dot"
            :class="{ 'carousel-dot--active': i === current }"
          />
        </div>
        <button class="carousel-btn" @click="next" aria-label="Siguiente">
          <AppIcon name="ChevronRight" :size="16" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.insights-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.insights-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* ── Lista completa (desktop ≥ 640px) ─────────────────── */
.insights-list {
  display: none;
  flex-direction: column;
  gap: 8px;
}
@media (min-width: 640px) {
  .insights-list    { display: flex; }
  .insights-carousel { display: none; }
}

/* ── Carrusel (mobile < 640px) ────────────────────────── */
.insights-carousel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Card compartida ─────────────────────────────────── */
.insight-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 14px;
  box-shadow: var(--card-shadow);
  transition: border-color 0.15s;
}
.insight-card:hover { border-color: rgba(91, 94, 244, 0.25); }
.insight-card--featured { border-color: rgba(91, 94, 244, 0.2); }

.insight-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.insight-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.insight-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-heading);
  line-height: 1.45;
}

.insight-value {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-primary);
}

/* ── Controles carrusel ───────────────────────────────── */
.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.carousel-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: border-color 0.15s, color 0.15s;
}
.carousel-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}
.carousel-dots {
  display: flex;
  gap: 5px;
}
.carousel-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--glass-border);
  transition: background 0.2s;
}
.carousel-dot--active {
  background: var(--accent-primary);
}
</style>
