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
} from 'chart.js'
import type { Mark, Rival } from '@/data/mock'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps<{
  myMarks: Mark[]
  rivals: Rival[]
  discipline: string
}>()

const COLORS = ['#6366f1', '#f59e0b', '#10b981']

const chartData = computed(() => {
  const myFiltered = [...props.myMarks]
    .filter((m) => m.discipline === props.discipline)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const allDates = [
    ...myFiltered.map((m) => m.date),
    ...props.rivals.flatMap((r) => r.marks.filter((m) => m.discipline === props.discipline).map((m) => m.date)),
  ]
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort()

  const labels = allDates.map((d) =>
    new Date(d).toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })
  )

  const myData = allDates.map((date) => {
    const found = myFiltered.find((m) => m.date === date)
    return found ? found.resultSeconds : null
  })

  const rivalDatasets = props.rivals.map((rival, i) => {
    const rivalMarks = rival.marks.filter((m) => m.discipline === props.discipline)
    const data = allDates.map((date) => {
      const found = rivalMarks.find((m) => m.date === date)
      return found ? found.resultSeconds : null
    })
    return {
      label: rival.name,
      data,
      borderColor: COLORS[i + 1] ?? '#aaa',
      backgroundColor: 'transparent',
      pointRadius: 4,
      tension: 0.3,
      borderDash: [5, 3],
      spanGaps: true,
    }
  })

  return {
    labels,
    datasets: [
      {
        label: 'Tú',
        data: myData,
        borderColor: COLORS[0],
        backgroundColor: 'rgba(99,102,241,0.1)',
        pointRadius: 5,
        tension: 0.4,
        spanGaps: true,
        fill: false,
      },
      ...rivalDatasets,
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#94a3b8', font: { size: 11 } },
    },
    y: {
      reverse: true,
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: {
        color: '#94a3b8',
        font: { size: 11 },
        callback: (val: number | string) => `${val}s`,
      },
    },
  },
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { size: 12 } },
    },
    tooltip: {
      backgroundColor: 'rgba(10,10,10,0.95)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#f8fafc',
      bodyColor: '#94a3b8',
    },
  },
}
</script>

<template>
  <div class="compare-chart">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.compare-chart {
  height: 300px;
  width: 100%;
}
</style>
