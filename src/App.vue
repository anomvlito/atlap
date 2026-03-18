<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuth } from '@clerk/vue'
import AppLayout from './components/layout/AppLayout.vue'
import AuthView from './views/AuthView.vue'

const { isSignedIn, isLoaded } = useAuth()
</script>

<template>
  <div class="app-root">
    <!-- Mientras Clerk carga la sesión -->
    <div v-if="!isLoaded" class="app-loading">
      <span class="app-loading__logo">ATLAP</span>
    </div>

    <template v-else>
      <!-- Usuario autenticado: app completa con layout -->
      <AppLayout v-if="isSignedIn">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </AppLayout>

      <!-- Sin sesión: pantalla de login -->
      <AuthView v-else />
    </template>
  </div>
</template>

<style>
.app-root {
  min-height: 100vh;
  background-color: var(--vt-c-black);
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

/* Loading screen */
.app-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vt-c-black);
}

.app-loading__logo {
  font-family: 'Outfit', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, var(--accent-primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  opacity: 0.6;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 1; }
}

/* Global scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--vt-c-black);
}

::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 10px;
  border: 2px solid var(--vt-c-black);
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
