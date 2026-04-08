<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const S = 4 // px por "pixel" lógico

const C: Record<string, string | null> = {
  '.': null,
  's': '#F8CBA6', // piel
  'r': '#5C3D2E', // cabello
  'p': '#5b5ef4', // camiseta (brand)
  'd': '#1e1b4b', // shorts / zapatillas / brazos
}

// 10 columnas × 13 filas — 4 frames del ciclo de carrera
const FRAMES = [
  // Frame 0 – zancada A (pierna derecha al frente)
  [
    '....ss....',
    '...ssss...',
    '..rssssr..',
    '..rse.sr..',
    '...ssss...',
    '.d.ppppp.p',
    '...ppppp..',
    '....ddd...',
    '...d...d..',
    '..d.....d.',
    '.d.......d',
    'dd.......d',
    '........dd',
  ],
  // Frame 1 – vuelo A (piernas recogiendo)
  [
    '....ss....',
    '...ssss...',
    '..rssssr..',
    '..rse.sr..',
    '...ssss...',
    '.d.ppppp.p',
    '...ppppp..',
    '....ddd...',
    '....d.d...',
    '...d...d..',
    '..d.....d.',
    '.dd.....dd',
    '.dd.....dd',
  ],
  // Frame 2 – zancada B (pierna izquierda al frente, espejo)
  [
    '....ss....',
    '...ssss...',
    '..rssssr..',
    '..rse.sr..',
    '...ssss...',
    '.d.ppppp.p',
    '...ppppp..',
    '....ddd...',
    '...d...d..',
    '..d.....d.',
    '.d.......d',
    'd.......dd',
    'dd........',
  ],
  // Frame 3 – vuelo B
  [
    '....ss....',
    '...ssss...',
    '..rssssr..',
    '..rse.sr..',
    '...ssss...',
    '.d.ppppp.p',
    '...ppppp..',
    '....ddd...',
    '....d.d...',
    '...d...d..',
    '..d.....d.',
    '.dd.....dd',
    'dd.....dd.',
  ],
]

const frameIndex = ref(0)
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => {
    frameIndex.value = (frameIndex.value + 1) % FRAMES.length
  }, 130)
})

onUnmounted(() => clearInterval(timer))

const pixels = computed(() => {
  const out: { x: number; y: number; c: string }[] = []
  const frame = FRAMES[frameIndex.value] ?? FRAMES[0]!
  frame.forEach((row, ri) => {
    ;[...row].forEach((ch, ci) => {
      const color = C[ch]
      if (color) out.push({ x: ci * S, y: ri * S, c: color })
    })
  })
  return out
})

const W = 10 * S // 40
const H = 13 * S // 52
</script>

<template>
  <div class="pixel-runner">
    <div class="pixel-runner__track">
      <!-- Líneas de velocidad -->
      <div class="pixel-runner__speedlines" aria-hidden="true">
        <span v-for="n in 5" :key="n" class="pixel-runner__line" :style="`--i:${n}`" />
      </div>

      <!-- Sprite del atleta -->
      <svg
        class="pixel-runner__sprite"
        :width="W"
        :height="H"
        :viewBox="`0 0 ${W} ${H}`"
        aria-hidden="true"
      >
        <rect
          v-for="(px, i) in pixels"
          :key="i"
          :x="px.x"
          :y="px.y"
          :width="S"
          :height="S"
          :fill="px.c"
        />
      </svg>
    </div>

    <!-- Pista -->
    <div class="pixel-runner__ground" aria-hidden="true">
      <span v-for="n in 24" :key="n" class="pixel-runner__dash" :style="`--j:${n}`" />
    </div>
  </div>
</template>

<style scoped>
.pixel-runner {
  width: min(360px, 88vw);
  margin: 0 auto;
}

/* ── Carril ── */
.pixel-runner__track {
  position: relative;
  height: 56px;
  overflow: hidden;
}

/* ── Líneas de velocidad (pasan de derecha a izquierda) ── */
.pixel-runner__speedlines {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.pixel-runner__line {
  position: absolute;
  top: calc(20% + var(--i) * 14%);
  right: -10%;
  width: calc(28% - var(--i) * 3%);
  height: 2px;
  background: var(--accent-primary);
  opacity: calc(0.12 + var(--i) * 0.04);
  border-radius: 1px;
  animation: speedline 0.7s linear infinite;
  animation-delay: calc(var(--i) * -0.14s);
}

@keyframes speedline {
  from { transform: translateX(0); }
  to   { transform: translateX(-400%); }
}

/* ── Sprite corriendo de izquierda a derecha ── */
.pixel-runner__sprite {
  position: absolute;
  bottom: 0;
  left: 0;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  animation: run-across 2.6s linear infinite;
}

@keyframes run-across {
  0%   { left: -48px; }
  100% { left: calc(100% + 48px); }
}

/* ── Pista con guiones animados ── */
.pixel-runner__ground {
  display: flex;
  gap: 0;
  align-items: center;
  height: 4px;
  overflow: hidden;
  position: relative;
}

.pixel-runner__dash {
  flex-shrink: 0;
  width: 12px;
  height: 2px;
  margin-right: 4px;
  background: var(--accent-primary);
  opacity: 0.25;
  border-radius: 1px;
  animation: dash-scroll 0.5s linear infinite;
  animation-delay: calc(var(--j) * -0.021s);
}

@keyframes dash-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-16px); }
}
</style>
