<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/marcas', icon: 'chart', label: 'Marcas' },
  { to: '/entrenamientos', icon: 'run', label: 'Entreno' },
  { to: '/analisis', icon: 'analytics', label: 'Análisis' },
  { to: '/perfil', icon: 'person', label: 'Perfil' },
]
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': route.path === item.to }"
    >
      <span class="bottom-nav__icon">
        <!-- Home -->
        <svg v-if="item.icon === 'home'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <!-- Chart -->
        <svg v-else-if="item.icon === 'chart'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3v18h18v-2H5V3H3zm4 12l3-4 3 3 3-5 3 4v2H7v-1l.01.01L7 15z"/>
        </svg>
        <!-- Run -->
        <svg v-else-if="item.icon === 'run'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
        </svg>
        <!-- Analytics -->
        <svg v-else-if="item.icon === 'analytics'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
        <!-- Person -->
        <svg v-else-if="item.icon === 'person'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </span>
      <span class="bottom-nav__label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  z-index: 50;
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 12px;
  text-decoration: none;
  color: var(--vt-c-text-dark-2);
  transition: color 0.2s;
  border-radius: 12px;
}

.bottom-nav__item--active {
  color: var(--accent-primary);
}

.bottom-nav__icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-nav__icon svg {
  width: 24px;
  height: 24px;
}

.bottom-nav__label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.02em;
}
</style>
