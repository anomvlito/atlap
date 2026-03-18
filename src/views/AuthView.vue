<script setup lang="ts">
import { SignIn } from '@clerk/vue'
</script>

<template>
  <div class="auth-page">
    <div class="auth-brand">
      <span class="auth-logo">ATLAP</span>
      <p class="auth-sub">Registra. Analiza. Mejora.</p>
    </div>

    <SignIn routing="hash" />
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #f4f4f8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.75rem;
  padding: 2rem 1rem;
}

.auth-brand {
  text-align: center;
}

.auth-logo {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 2.25rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: #111120;
}

.auth-sub {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}
</style>
