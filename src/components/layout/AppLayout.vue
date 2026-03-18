<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import SideNav from './SideNav.vue'
import BottomNav from './BottomNav.vue'

const isDesktop = useMediaQuery('(min-width: 1024px)')
</script>

<template>
  <div class="app-layout">
    <SideNav v-if="isDesktop" class="sidebar-wrapper" />
    
    <div class="layout-body" :class="{ 'layout-body--desktop': isDesktop }">
      <main class="page-content">
        <slot />
      </main>
      <BottomNav v-if="!isDesktop" />
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-background);
}

.sidebar-wrapper {
  flex-shrink: 0;
}

.layout-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

.page-content {
  flex: 1;
  width: 100%;
  padding-bottom: 100px; /* Space for BottomNav */
}

@media (min-width: 1024px) {
  .page-content {
    padding-bottom: 0;
  }
}
</style>
