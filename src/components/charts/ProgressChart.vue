<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { Mark } from '@/data/mock'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  marks: Mark[]
  discipline: string
}>()

const chartData = computed(() => {
  const sorted = [...props.marks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  return {
    labels: sorted.map((m) =>
      new Date(m.date).toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })
    ),
    datasets: [
      {
        label: props.discipline,
        data: sorted.map((m) => m.resultSeconds),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        pointBackgroundColor: sorted.map((m) => (m.isPR ? '#10b981' : '#6366f1')),
        pointRadius: sorted.map((m) => (m.isPR ? 8 : 5)),
        pointHoverRadius: 10,
        tension: 0.4,
        fill: true,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#94a3b8', font: { size: 11 } },
    },
    y: {
      reverse: true, // menor tiempo = mejor
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: {
        color: '#94a3b8',
        font: { size: 11 },
        callback: (val: number | string) => {
          const s = Number(val)
          if (s >= 60) {
            const min = Math.floor(s / 60)
            const sec = (s % 60).toFixed(1)
            return `${min}:${sec.padStart(4, '0')}`
          }
          return `${s}s`
        },
      },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(10,10,10,0.95)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#f8fafc',
      bodyColor: '#94a3b8',
      callbacks: {
        title: (ctx: { label: string }[]) => ctx[0]?.label ?? '',
        label: (ctx: { raw: unknown }) => {
          const s = Number(ctx.raw)
          if (s >= 60) {
            const min = Math.floor(s / 60)
            const sec = (s % 60).toFixed(1)
            return ` ${min}:${sec.padStart(4, '0')}`
          }
          return ` ${s}s`
        },
      },
    },
  },
}))
</script>

<template>
  <div class="progress-chart">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.progress-chart {
  height: 280px;
  width: 100%;
}
</style>
