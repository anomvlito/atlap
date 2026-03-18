<script setup lang="ts">
import { SignIn } from '@clerk/vue'

// Clerk appearance personalizada para coincidir con el design system de ATLAP
const clerkAppearance = {
  variables: {
    colorBackground:      '#0d0d0f',
    colorInputBackground: 'rgba(255, 255, 255, 0.05)',
    colorText:            '#e8e8f0',
    colorTextSecondary:   'rgba(232, 232, 240, 0.6)',
    colorPrimary:         '#5b5ef4',
    colorInputText:       '#e8e8f0',
    colorNeutral:         '#e8e8f0',
    borderRadius:         '12px',
    fontFamily:           'Inter, sans-serif',
    fontSize:             '15px',
  },
  elements: {
    card:               'atlap-clerk-card',
    formButtonPrimary:  'atlap-clerk-btn',
    footerActionLink:   'atlap-clerk-link',
    headerTitle:        'atlap-clerk-title',
    headerSubtitle:     'atlap-clerk-subtitle',
    socialButtonsBlockButton: 'atlap-clerk-social-btn',
  },
}
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-brand">
      <span class="auth-logo">ATLAP</span>
      <p class="auth-tagline">Tu rendimiento, en datos</p>
    </div>

    <SignIn
      :appearance="clerkAppearance"
      routing="hash"
    />
  </div>
</template>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem 1rem;
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(91, 94, 244, 0.15), transparent),
    var(--vt-c-black);
}

.auth-brand {
  text-align: center;
}

.auth-logo {
  font-family: 'Outfit', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, var(--accent-primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.auth-tagline {
  margin-top: 0.25rem;
  font-size: 0.95rem;
  color: rgba(232, 232, 240, 0.5);
}
</style>

<!-- Estilos globales para los elementos internos de Clerk (no scoped) -->
<style>
.atlap-clerk-card {
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
}

.atlap-clerk-btn {
  background: var(--accent-primary) !important;
  font-weight: 600 !important;
}

.atlap-clerk-btn:hover {
  background: #4a4dd4 !important;
}

.atlap-clerk-link {
  color: var(--accent-primary) !important;
}

.atlap-clerk-social-btn {
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: var(--color-text) !important;
}
</style>
