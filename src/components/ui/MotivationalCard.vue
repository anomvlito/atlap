<script setup lang="ts">
import { useAthleteStore } from '@/stores/athlete'

const store = useAthleteStore()
</script>

<template>
  <div class="motivational-card">
    <div class="motivational-card__quote-mark">"</div>
    <p class="motivational-card__text">{{ store.dailyQuote?.text }}</p>
    <p class="motivational-card__author">— {{ store.dailyQuote?.author }}</p>
  </div>
</template>

<style scoped>
.motivational-card {
  position: relative;
  background: var(--glass-bg);
  border: 1px solid rgba(91, 94, 244, 0.3);
  border-radius: 16px;
  padding: 28px 24px 20px;
  box-shadow: var(--card-shadow), 0 0 40px rgba(91, 94, 244, 0.06) inset;
  overflow: hidden;
}

.motivational-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle at top right, rgba(91, 94, 244, 0.12), transparent 70%);
  pointer-events: none;
}

.motivational-card__quote-mark {
  position: absolute;
  top: -4px;
  left: 16px;
  font-size: 72px;
  line-height: 1;
  color: var(--accent-primary);
  opacity: 0.35;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 900;
  user-select: none;
}

.motivational-card__text {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-heading);
  line-height: 1.6;
  padding-top: 8px;
}

.motivational-card__author {
  margin-top: 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-primary);
  letter-spacing: 0.02em;
}
</style>
