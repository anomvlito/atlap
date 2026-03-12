<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import SidebarNav from './SidebarNav.vue'
import BottomNav from './BottomNav.vue'

const isDesktop = useMediaQuery('(min-width: 768px)')
</script>

<template>
  <div class="app-layout" :class="{ 'app-layout--desktop': isDesktop }">
    <SidebarNav v-if="isDesktop" />
    <main class="app-layout__main" :class="{ 'app-layout__main--with-sidebar': isDesktop }">
      <slot />
    </main>
    <BottomNav v-if="!isDesktop" />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: var(--color-background);
}

.app-layout__main {
  padding-bottom: 80px; /* espacio para bottom nav */
}

.app-layout__main--with-sidebar {
  margin-left: 240px;
  padding-bottom: 0;
  min-height: 100vh;
}
</style>
