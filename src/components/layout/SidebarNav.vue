<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { useAthleteStore } from '@/stores/athlete'

const route = useRoute()
const store = useAthleteStore()

const navItems = [
  { to: '/', icon: 'home', label: 'Dashboard' },
  { to: '/marcas', icon: 'chart', label: 'Marcas' },
  { to: '/entrenamientos', icon: 'run', label: 'Entrenamientos' },
  { to: '/analisis', icon: 'analytics', label: 'Análisis' },
  { to: '/equipo', icon: 'team', label: 'Equipo' },
  { to: '/perfil', icon: 'person', label: 'Perfil' },
]
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__logo">
      <span class="sidebar__logo-text">ATLAP</span>
      <span class="sidebar__logo-badge">MVP</span>
    </div>

    <div class="sidebar__athlete">
      <img
        :src="store.athlete.avatar"
        :alt="store.athlete.name"
        class="sidebar__avatar"
      />
      <div class="sidebar__athlete-info">
        <p class="sidebar__athlete-name">{{ store.athlete.name }}</p>
        <p class="sidebar__athlete-club">{{ store.athlete.club }}</p>
      </div>
    </div>

    <nav class="sidebar__nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="sidebar__nav-item"
        :class="{ 'sidebar__nav-item--active': route.path === item.to }"
      >
        <span class="sidebar__nav-icon">
          <svg v-if="item.icon === 'home'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <svg v-else-if="item.icon === 'chart'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3v18h18v-2H5V3H3zm4 12l3-4 3 3 3-5 3 4v2H7v-1l.01.01L7 15z"/>
          </svg>
          <svg v-else-if="item.icon === 'run'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
          </svg>
          <svg v-else-if="item.icon === 'analytics'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
          </svg>
          <svg v-else-if="item.icon === 'team'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          <svg v-else-if="item.icon === 'person'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar__footer">
      <span class="sidebar__version">v0.1 MVP</span>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: rgba(10, 10, 10, 0.95);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 40;
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
  padding: 0 8px;
}

.sidebar__logo-text {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.1em;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar__logo-badge {
  font-size: 10px;
  font-weight: 600;
  color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 6px;
  padding: 2px 6px;
}

.sidebar__athlete {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  margin-bottom: 24px;
}

.sidebar__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--accent-primary);
}

.sidebar__athlete-info {
  flex: 1;
  min-width: 0;
}

.sidebar__athlete-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-heading);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__athlete-club {
  font-size: 11px;
  color: var(--vt-c-text-dark-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.sidebar__nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: var(--vt-c-text-dark-2);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.sidebar__nav-item:hover {
  background: var(--glass-bg);
  color: var(--color-heading);
}

.sidebar__nav-item--active {
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.sidebar__nav-icon svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidebar__footer {
  padding: 8px;
  text-align: center;
}

.sidebar__version {
  font-size: 11px;
  color: var(--vt-c-text-dark-2);
  opacity: 0.5;
}
</style>
