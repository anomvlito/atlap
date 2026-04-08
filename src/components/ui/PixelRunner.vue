<script setup lang="ts">
// Corredor 8-bit con SVG geométrico + animación CSS pura
// Sin assets externos — proporciones humanas claras
</script>

<template>
  <div class="runner-wrap" aria-hidden="true">
    <div class="runner-track">
      <!-- SVG corredor: cada parte del cuerpo es un rect/circle para look pixel-art -->
      <svg class="runner" width="32" height="48" viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
        <!-- Cabeza -->
        <rect x="10" y="0" width="12" height="10" rx="1" fill="#F8CBA6"/>
        <!-- Pelo -->
        <rect x="10" y="0" width="12" height="3" rx="1" fill="#292524"/>
        <!-- Ojo -->
        <rect x="18" y="4" width="2" height="2" fill="#292524"/>
        <!-- Cuello -->
        <rect x="13" y="10" width="6" height="3" fill="#F8CBA6"/>
        <!-- Cuerpo / camiseta -->
        <rect x="9" y="13" width="14" height="11" rx="1" fill="#5b5ef4"/>
        <!-- Shorts -->
        <rect x="11" y="24" width="10" height="5" rx="1" fill="#1e1b4b"/>

        <!-- Brazo izquierdo (anima rotation desde hombro) -->
        <g class="arm-left" style="transform-origin: 9px 15px">
          <rect x="4" y="13" width="5" height="10" rx="2" fill="#5b5ef4"/>
        </g>
        <!-- Brazo derecho -->
        <g class="arm-right" style="transform-origin: 23px 15px">
          <rect x="23" y="13" width="5" height="10" rx="2" fill="#5b5ef4"/>
        </g>

        <!-- Pierna izquierda: muslo + espinilla como grupo pivotando desde cadera -->
        <g class="leg-left" style="transform-origin: 13px 29px">
          <rect x="11" y="29" width="5" height="8" rx="1" fill="#1e1b4b"/>
          <g class="shin-left" style="transform-origin: 13px 37px">
            <rect x="11" y="37" width="5" height="7" rx="1" fill="#292524"/>
            <!-- Zapatilla izquierda -->
            <rect x="9"  y="43" width="7" height="3" rx="1" fill="#111827"/>
          </g>
        </g>

        <!-- Pierna derecha -->
        <g class="leg-right" style="transform-origin: 19px 29px">
          <rect x="17" y="29" width="5" height="8" rx="1" fill="#1e1b4b"/>
          <g class="shin-right" style="transform-origin: 19px 37px">
            <rect x="17" y="37" width="5" height="7" rx="1" fill="#292524"/>
            <!-- Zapatilla derecha -->
            <rect x="17" y="43" width="7" height="3" rx="1" fill="#111827"/>
          </g>
        </g>
      </svg>
    </div>
    <!-- Pista -->
    <div class="runner-ground"/>
  </div>
</template>

<style scoped>
.runner-wrap {
  width: min(360px, 90vw);
  margin: 0 auto;
}

/* ── Carril ── */
.runner-track {
  position: relative;
  height: 64px;
  overflow: hidden;
}

/* ── Corredor se mueve de izquierda a derecha ── */
.runner {
  position: absolute;
  bottom: 4px;
  left: 0;
  image-rendering: pixelated;
  /* se escala al doble para que sea visible */
  transform: scale(2);
  transform-origin: left bottom;
  animation: run-cross 3s linear infinite;
}

@keyframes run-cross {
  0%   { left: -80px; }
  100% { left: calc(100% + 20px); }
}

/* ── Ciclo de carrera: piernas ── */
.leg-left {
  animation: leg-l 0.52s ease-in-out infinite alternate;
}
.leg-right {
  animation: leg-r 0.52s ease-in-out infinite alternate;
}
.shin-left {
  animation: shin-l 0.52s ease-in-out infinite alternate;
}
.shin-right {
  animation: shin-r 0.52s ease-in-out infinite alternate;
}

@keyframes leg-l {
  0%   { transform: rotate(-30deg); }
  100% { transform: rotate(35deg); }
}
@keyframes leg-r {
  0%   { transform: rotate(35deg); }
  100% { transform: rotate(-30deg); }
}
@keyframes shin-l {
  0%   { transform: rotate(0deg); }
  50%  { transform: rotate(40deg); }
  100% { transform: rotate(10deg); }
}
@keyframes shin-r {
  0%   { transform: rotate(10deg); }
  50%  { transform: rotate(40deg); }
  100% { transform: rotate(0deg); }
}

/* ── Brazos (opuesto a las piernas) ── */
.arm-left {
  animation: arm-l 0.52s ease-in-out infinite alternate;
}
.arm-right {
  animation: arm-r 0.52s ease-in-out infinite alternate;
}
@keyframes arm-l {
  0%   { transform: rotate(35deg); }
  100% { transform: rotate(-25deg); }
}
@keyframes arm-r {
  0%   { transform: rotate(-25deg); }
  100% { transform: rotate(35deg); }
}

/* ── Suelo ── */
.runner-ground {
  height: 2px;
  background: linear-gradient(90deg, transparent, #5b5ef4 25%, #5b5ef4 75%, transparent);
  opacity: 0.35;
  border-radius: 1px;
}
</style>
