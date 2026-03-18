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
import { getDisciplineConfig, formatResult } from '@/types/discipline'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  marks: Mark[]
  discipline: string
}>()

const disciplineConfig = computed(() => getDisciplineConfig(props.discipline))

const chartData = computed(() => {
  const sorted = [...props.marks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  return {
    labels: sorted.map((m) =>
      new Date(m.date).toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })
    ),
    datasets: [
      {
        label: props.discipline,
        data: sorted.map((m) => m.resultValue),
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

const chartOptions = computed(() => {
  const unit = disciplineConfig.value?.resultUnit ?? 'seconds'
  const reverse = (disciplineConfig.value?.betterIs ?? 'lower') === 'lower'
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.07)' },
        ticks: { color: '#6b7280', font: { size: 11 } },
      },
      y: {
        reverse,
        grid: { color: 'rgba(0,0,0,0.07)' },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
          callback: (val: number | string) => formatResult(Number(val), unit),
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10,10,10,0.95)',
        borderColor: 'rgba(0,0,0,0.12)',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        callbacks: {
          title: (ctx: { label: string }[]) => ctx[0]?.label ?? '',
          label: (ctx: { raw: unknown }) => ` ${formatResult(Number(ctx.raw), unit)}`,
        },
      },
    },
  }
})
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
