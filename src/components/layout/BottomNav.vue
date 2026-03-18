<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'

const route = useRoute()

const navItems = [
  { name: 'Inicio', path: '/', icon: 'Home' },
  { name: 'Entrenos', path: '/entrenamientos', icon: 'Activity' },
  { name: 'Marcas', path: '/marcas', icon: 'Trophy' },
  { name: 'Análisis', path: '/analisis', icon: 'BarChart' },
  { name: 'Perfil', path: '/perfil', icon: 'User' }
]
</script>

<template>
  <nav class="bottom-nav">
    <div class="bottom-nav__container">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ 'nav-item--active': route.path === item.path }"
      >
        <div class="nav-item__icon">
          <AppIcon :name="item.icon" :size="22" />
        </div>
        <span class="nav-item__label">{{ item.name }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--glass-border);
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
  z-index: 1000;
}

.bottom-nav__container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: var(--vt-c-text-dark-2);
  transition: all 0.2s;
  flex: 1;
}

.nav-item__icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.2s;
}

.nav-item__label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.nav-item--active {
  color: var(--accent-primary);
}

.nav-item--active .nav-item__icon {
  background: rgba(255, 60, 4, 0.1);
  transform: translateY(-2px);
}

/* Glassmorphism accent */
.bottom-nav::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background: var(--accent-primary);
  border-radius: 0 0 2px 2px;
  box-shadow: 0 0 10px var(--accent-glow);
  opacity: 0;
  transition: opacity 0.3s;
}
</style>
