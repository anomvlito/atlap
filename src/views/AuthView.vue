<script setup lang="ts">
import { SignIn } from '@clerk/vue'
import { dark } from '@clerk/themes'

// Base: dark oficial de Clerk (resuelve inputs blancos, contraste interno, etc.)
// Override: colores ATLAP encima
const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorBackground:  '#111120',   // card — claramente diferente al fondo (#070710)
    colorPrimary:     '#5b5ef4',
    colorText:        '#f1f1f8',
    colorTextSecondary: '#94a3b8',
    colorInputText:   '#f1f1f8',
    colorInputBackground: '#1a1a2e',  // hex, no rgba — Clerk lo acepta correctamente
    borderRadius:     '14px',
    fontFamily:       'Inter, sans-serif',
    fontSize:         '15px',
    colorNeutral:     '#f1f1f8',
  },
  elements: {
    // Card con borde visible
    card: {
      backgroundColor: '#111120',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 0 0 1px rgba(91,94,244,0.12), 0 28px 64px rgba(0,0,0,0.8)',
    },
    // Header de Clerk — ocultar "Sign in to My Application" ya que tenemos nuestra brand arriba
    headerTitle:    { display: 'none' },
    headerSubtitle: { display: 'none' },
    // Inputs oscuros con borde sutil
    formFieldInput: {
      backgroundColor: '#1a1a2e',
      borderColor: 'rgba(255,255,255,0.12)',
      color: '#f1f1f8',
    },
    // Social buttons
    socialButtonsBlockButton: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderColor: 'rgba(255,255,255,0.1)',
    },
    // Footer link
    footerActionLink: { color: '#5b5ef4' },
  },
}
</script>

<template>
  <div class="auth-page">
    <!-- Glows atmosféricos -->
    <div class="glow glow--purple" aria-hidden="true" />
    <div class="glow glow--indigo" aria-hidden="true" />

    <div class="auth-shell">
      <!-- Brand -->
      <header class="auth-header">
        <h1 class="auth-title">ATLAP</h1>
        <p class="auth-sub">Registra. Analiza. Mejora.</p>
      </header>

      <!-- Clerk sign-in -->
      <div class="clerk-wrap">
        <SignIn :appearance="clerkAppearance" routing="hash" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Página ─────────────────────────────────────────── */
.auth-page {
  min-height: 100vh;
  background: #070710;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
}

/* ── Glows de fondo ─────────────────────────────────── */
.glow {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.5;
}

.glow--indigo {
  width: 700px;
  height: 400px;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(ellipse, rgba(91, 94, 244, 0.3) 0%, transparent 65%);
}

.glow--purple {
  width: 400px;
  height: 300px;
  bottom: -60px;
  right: 5%;
  background: radial-gradient(ellipse, rgba(168, 85, 247, 0.2) 0%, transparent 65%);
}

/* ── Contenedor central ──────────────────────────────── */
.auth-shell {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 420px;
}

/* ── Brand ──────────────────────────────────────────── */
.auth-header {
  text-align: center;
}

.auth-title {
  font-family: 'Outfit', sans-serif;
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #ffffff 20%, #5b5ef4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.auth-sub {
  margin-top: 0.4rem;
  font-size: 0.9rem;
  color: #4a5568;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
}

/* ── Clerk wrapper ───────────────────────────────────── */
.clerk-wrap {
  width: 100%;
}
</style>
