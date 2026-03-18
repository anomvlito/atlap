<script setup lang="ts">
import { SignIn } from '@clerk/vue'

// colorBackground de Clerk = fondo del card (no de la página).
// Página es #06060c → card es #13131e → contraste visible.
const clerkAppearance = {
  variables: {
    colorBackground:      '#13131e',
    colorInputBackground: 'rgba(255, 255, 255, 0.07)',
    colorText:            '#f0f0f8',
    colorTextSecondary:   '#94a3b8',
    colorPrimary:         '#5b5ef4',
    colorInputText:       '#f0f0f8',
    colorNeutral:         '#f0f0f8',
    borderRadius:         '14px',
    fontFamily:           'Inter, sans-serif',
    fontSize:             '15px',
  },
  elements: {
    card:                     'atlap-clerk-card',
    formButtonPrimary:        'atlap-clerk-btn',
    footerActionLink:         'atlap-clerk-link',
    socialButtonsBlockButton: 'atlap-clerk-social-btn',
    formFieldInput:           'atlap-clerk-input',
  },
}
</script>

<template>
  <div class="auth-page">
    <!-- Glows de fondo -->
    <div class="auth-glow auth-glow--top" aria-hidden="true" />
    <div class="auth-glow auth-glow--bottom" aria-hidden="true" />

    <div class="auth-content">
      <!-- Brand -->
      <div class="auth-brand">
        <span class="auth-logo">ATLAP</span>
        <p class="auth-tagline">Tu rendimiento, en datos</p>
      </div>

      <!-- Clerk card -->
      <SignIn :appearance="clerkAppearance" routing="hash" />
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #06060c;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
}

.auth-glow {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(80px);
}

.auth-glow--top {
  width: 600px;
  height: 400px;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(ellipse, rgba(91, 94, 244, 0.18) 0%, transparent 70%);
}

.auth-glow--bottom {
  width: 400px;
  height: 300px;
  bottom: -80px;
  right: 10%;
  background: radial-gradient(ellipse, rgba(168, 85, 247, 0.10) 0%, transparent 70%);
}

.auth-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.75rem;
  width: 100%;
}

.auth-brand {
  text-align: center;
}

.auth-logo {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 2.25rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #ffffff 30%, #5b5ef4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-tagline {
  margin-top: 0.3rem;
  font-size: 0.9rem;
  color: #64748b;
  letter-spacing: 0.02em;
}
</style>

<!-- Estilos globales para el interior del componente Clerk (no puede ser scoped) -->
<style>
/* Card principal */
.atlap-clerk-card {
  background: #13131e !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow:
    0 0 0 1px rgba(91, 94, 244, 0.08),
    0 24px 64px rgba(0, 0, 0, 0.7) !important;
}

/* Inputs */
.atlap-clerk-input {
  border-color: rgba(255, 255, 255, 0.12) !important;
}
.atlap-clerk-input:focus {
  border-color: rgba(91, 94, 244, 0.6) !important;
  box-shadow: 0 0 0 3px rgba(91, 94, 244, 0.12) !important;
}

/* Botón primario */
.atlap-clerk-btn {
  background: #5b5ef4 !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 14px rgba(91, 94, 244, 0.35) !important;
}
.atlap-clerk-btn:hover {
  background: #4a4dd4 !important;
}

/* Links */
.atlap-clerk-link {
  color: #5b5ef4 !important;
}

/* Social buttons */
.atlap-clerk-social-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
.atlap-clerk-social-btn:hover {
  background: rgba(255, 255, 255, 0.08) !important;
}
</style>
