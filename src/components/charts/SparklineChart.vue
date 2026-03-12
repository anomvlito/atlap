<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js'
import type { Mark } from '@/data/mock'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler)

const props = defineProps<{
  marks: Mark[]
}>()

const chartData = computed(() => {
  const recent = [...props.marks]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-8)

  return {
    labels: recent.map(() => ''),
    datasets: [
      {
        data: recent.map((m) => m.resultSeconds),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        pointRadius: 0,
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { display: false },
    y: { display: false, reverse: true },
  },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  elements: { point: { radius: 0 } },
}
</script>

<template>
  <div class="sparkline">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.sparkline {
  height: 60px;
  width: 100%;
}
</style>
