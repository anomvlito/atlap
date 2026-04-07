<script setup lang="ts">
import { computed } from 'vue'
import { Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import type { MultifactorScore } from '@/services/multifactor'

ChartJS.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const props = defineProps<{
  current: MultifactorScore
  previous?: MultifactorScore | null
}>()

const LABELS = ['Velocidad', 'Físico', 'Técnica', 'Mental', 'Recuperación', 'Contexto']

function scoreToData(s: MultifactorScore): number[] {
  return [s.velocidad, s.fisico, s.tecnica, s.mental, s.recuperacion, s.contexto]
}

const chartData = computed(() => {
  const datasets = [
    {
      label: props.current.cycleName,
      data: scoreToData(props.current),
      backgroundColor: 'rgba(91, 94, 244, 0.15)',
      borderColor: '#5b5ef4',
      borderWidth: 2.5,
      pointBackgroundColor: '#5b5ef4',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
    },
  ]

  if (props.previous) {
    datasets.push({
      label: props.previous.cycleName,
      data: scoreToData(props.previous),
      backgroundColor: 'rgba(107, 114, 128, 0.07)',
      borderColor: 'rgba(107, 114, 128, 0.45)',
      borderWidth: 1.5,
      pointBackgroundColor: 'rgba(107, 114, 128, 0.5)',
      pointBorderColor: '#fff',
      pointBorderWidth: 1,
      pointRadius: 3,
    })
  }

  return { labels: LABELS, datasets }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: {
        stepSize: 25,
        display: false,
      },
      grid: {
        color: 'rgba(0,0,0,0.07)',
      },
      angleLines: {
        color: 'rgba(0,0,0,0.07)',
      },
      pointLabels: {
        color: '#6b7280',
        font: { size: 12, weight: 600 },
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        color: '#6b7280',
        font: { size: 11 },
        boxWidth: 12,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: '#fff',
      borderColor: 'rgba(0,0,0,0.09)',
      borderWidth: 1,
      titleColor: '#111827',
      bodyColor: '#6b7280',
      callbacks: {
        label: (item: { dataset: { label?: string }; raw: unknown }) =>
          ` ${item.dataset.label}: ${item.raw}`,
      },
    },
  },
}
</script>

<template>
  <div class="radar-wrapper">
    <Radar :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.radar-wrapper {
  position: relative;
  width: 100%;
  height: 320px;
}
@media (min-width: 640px) {
  .radar-wrapper { height: 380px; }
}
</style>
