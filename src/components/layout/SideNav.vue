<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAthleteStore } from '@/stores/athlete'

const route = useRoute()
const store = useAthleteStore()

const navItems = [
  { name: 'Dashboard', path: '/', icon: 'Home' },
  { name: 'Entrenamientos', path: '/entrenamientos', icon: 'Activity' },
  { name: 'Marcas y Récords', path: '/marcas', icon: 'Trophy' },
  { name: 'Análisis Pro', path: '/analisis', icon: 'BarChart' },
  { name: 'Mi Equipo', path: '/equipo', icon: 'Users' },
  { name: 'Perfil Atleta', path: '/perfil', icon: 'User' }
]
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__logo">
      <div class="logo-icon">
        <AppIcon name="Zap" :size="24" />
      </div>
      <span class="logo-text">ATLAP</span>
    </div>

    <nav class="sidebar__nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-link"
        :class="{ 'nav-link--active': route.path === item.path }"
      >
        <AppIcon :name="item.icon" :size="20" />
        <span>{{ item.name }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar__footer">
      <div class="user-info">
        <img :src="store.athlete.avatar" :alt="store.athlete.name" class="user-avatar" />
        <div class="user-details">
          <p class="user-name">{{ store.athlete.name }}</p>
          <p class="user-club">{{ store.athlete.club }}</p>
        </div>
      </div>
      <button class="settings-btn">
        <AppIcon name="Settings" :size="20" />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: var(--vt-c-black-soft);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  padding: 32px 16px;
  position: sticky;
  top: 0;
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  margin-bottom: 48px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--accent-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px var(--accent-glow);
}

.logo-text {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--color-heading);
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--vt-c-text-dark-2);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-heading);
}

.nav-link--active {
  background: rgba(91, 94, 244, 0.1);
  color: var(--accent-primary);
}

.sidebar__footer {
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width:0;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--glass-border);
  flex-shrink: 0;
}

.user-details {
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-heading);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-club {
  font-size: 11px;
  color: var(--vt-c-text-dark-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.settings-btn {
  background: transparent;
  border: none;
  color: var(--vt-c-text-dark-2);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-heading);
}
</style>
