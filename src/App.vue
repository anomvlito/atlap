<script setup lang="ts">
import { RouterView } from 'vue-router'
import BottomNav from '@/components/layout/BottomNav.vue'
</script>

<template>
  <div class="app-container">
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
    <BottomNav />
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  background-color: var(--vt-c-black);
  color: var(--vt-c-text-dark-1);
}

.main-content {
  padding: 20px 20px 100px 20px;
  max-width: 800px;
  margin: 0 auto;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
