<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuth } from '@clerk/vue'
import AppLayout from './components/layout/AppLayout.vue'
import AuthView from './views/AuthView.vue'
import OnboardingView from './views/OnboardingView.vue'
import { useCurrentUser } from './composables/useCurrentUser'

const { isSignedIn, isLoaded } = useAuth()
const { isChecking, isOnboarded, refreshUser } = useCurrentUser()
</script>

<template>
  <div class="app-root">
    <!-- Mientras Clerk carga la sesión -->
    <div v-if="!isLoaded" class="app-loading">
      <span class="app-loading__logo">ATLAP</span>
    </div>

    <template v-else>
      <template v-if="isSignedIn">
        <!-- Verificando perfil en DB -->
        <div v-if="isChecking" class="app-loading">
          <span class="app-loading__logo">ATLAP</span>
        </div>

        <!-- Onboarding: primera vez -->
        <OnboardingView v-else-if="!isOnboarded" @complete="refreshUser" />

        <!-- App completa con layout -->
        <AppLayout v-else>
          <RouterView v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </RouterView>
        </AppLayout>
      </template>

      <!-- Sin sesión: pantalla de login -->
      <AuthView v-else />
    </template>
  </div>
</template>

<style>
.app-root {
  min-height: 100vh;
  background-color: var(--color-background);
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
  background: var(--color-background);
}

.app-loading__logo {
  font-family: 'Outfit', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-heading) 0%, var(--accent-primary) 100%);
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
  background: var(--color-background-soft);
}

::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 10px;
  border: 2px solid var(--color-background-soft);
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.18);
}
</style>
