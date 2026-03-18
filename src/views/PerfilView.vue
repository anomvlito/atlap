<script setup lang="ts">
import { computed } from 'vue'
import { useAuth, useUser } from '@clerk/vue'
import MedalCounter from '@/components/ui/MedalCounter.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCurrentUser } from '@/composables/useCurrentUser'

const { signOut } = useAuth()
const { user } = useUser()
const { dbUser } = useCurrentUser()

const displayName = computed(() => dbUser.value?.fullName || user.value?.firstName || 'Atleta')

const disciplines = computed(() => {
  const disc = dbUser.value?.discipline
  return disc ? disc.split(',').map(d => d.trim()).filter(Boolean) : []
})

const age = computed(() => {
  const birth = dbUser.value?.birthDate
  if (!birth) return null
  const now = new Date()
  return Math.floor((now.getTime() - new Date(birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
})

const avatarUrl = computed(
  () => user.value?.imageUrl
    || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName.value}`
)
</script>

<template>
  <div class="perfil">
    <!-- Hero perfil -->
    <div class="perfil__hero">
      <img :src="avatarUrl" :alt="displayName" class="perfil__avatar" />
      <div class="perfil__info">
        <h1 class="perfil__name">{{ displayName }}</h1>
        <div class="perfil__disciplines">
          <span v-if="disciplines.length === 0" class="discipline-chip discipline-chip--empty">
            Sin disciplinas
          </span>
          <span v-for="disc in disciplines" :key="disc" class="discipline-chip">
            {{ disc }}
          </span>
        </div>
      </div>
    </div>

    <!-- Stats básicos -->
    <section class="stats-section">
      <h2 class="section-title">Tu perfil</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <p class="stat-card__value">{{ age ?? '—' }}</p>
          <p class="stat-card__label">Años de edad</p>
        </div>
        <div class="stat-card">
          <p class="stat-card__value">{{ dbUser?.height ? `${dbUser.height} cm` : '—' }}</p>
          <p class="stat-card__label">Estatura</p>
        </div>
        <div class="stat-card">
          <p class="stat-card__value">{{ disciplines.length || '—' }}</p>
          <p class="stat-card__label">Disciplinas</p>
        </div>
      </div>
    </section>

    <!-- Palmarés demo -->
    <section class="medals-section">
      <h2 class="section-title">Palmarés (demo)</h2>
      <MedalCounter />
    </section>

    <!-- Información personal -->
    <section class="info-section">
      <h2 class="section-title">Información personal</h2>
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Nombre completo</span>
          <span class="info-value">{{ dbUser?.fullName || '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">{{ user?.primaryEmailAddress?.emailAddress || '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha de nacimiento</span>
          <span class="info-value">
            {{ dbUser?.birthDate ? new Date(dbUser.birthDate).toLocaleDateString('es-CL') : '—' }}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Género</span>
          <span class="info-value" style="text-transform: capitalize">{{ dbUser?.gender || '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Disciplinas</span>
          <span class="info-value">{{ disciplines.join(', ') || '—' }}</span>
        </div>
      </div>
    </section>

    <!-- Configuración -->
    <section class="config-section">
      <h2 class="section-title">Configuración</h2>
      <div class="config-list">
        <div class="config-item">
          <span>Notificaciones de entrenamiento</span>
          <span class="config-badge">Próximamente</span>
        </div>
        <div class="config-item">
          <span>Sincronizar wearables</span>
          <span class="config-badge">Próximamente</span>
        </div>
        <div class="config-item">
          <span>Exportar datos</span>
          <span class="config-badge">Próximamente</span>
        </div>
        <button class="config-item config-item--danger" @click="signOut()">
          <span class="signout-label">
            <AppIcon name="LogOut" :size="16" />
            Cerrar sesión
          </span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.perfil {
  padding: 24px 16px;
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-bottom: 100px;
}

@media (min-width: 1024px) {
  .perfil {
    max-width: 900px;
    padding: 40px 40px 60px;
    display: grid;
    grid-template-columns: 300px 1fr;
    grid-template-areas:
      "hero   stats"
      "medals info"
      "medals config";
    gap: 32px;
  }

  .perfil__hero    { grid-area: hero; }
  .stats-section   { grid-area: stats; }
  .medals-section  { grid-area: medals; }
  .info-section    { grid-area: info; }
  .config-section  { grid-area: config; }

  .perfil__hero {
    flex-direction: column;
    text-align: center;
    padding: 28px 20px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    align-self: start;
  }

  .perfil__avatar {
    width: 100px;
    height: 100px;
    margin: 0 auto 16px;
  }
}

/* Hero */
.perfil__hero {
  display: flex;
  align-items: center;
  gap: 20px;
}

.perfil__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid var(--accent-primary);
  flex-shrink: 0;
}

.perfil__name {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-heading);
  margin-bottom: 8px;
}

.perfil__disciplines {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.discipline-chip {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(91, 94, 244, 0.12);
  border: 1px solid rgba(91, 94, 244, 0.25);
  color: var(--accent-primary);
}

.discipline-chip--empty {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  color: var(--color-text-muted);
  font-weight: 400;
}

/* Section title */
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 12px;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 16px;
  text-align: center;
  box-shadow: var(--card-shadow);
}

.stat-card__value {
  font-size: 22px;
  font-weight: 800;
  color: var(--accent-primary);
}

.stat-card__label {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

/* Info card */
.info-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 13px 16px;
  border-bottom: 1px solid var(--glass-border);
  gap: 12px;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 13px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.info-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-heading);
  text-align: right;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Config list */
.config-list {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--glass-border);
  font-size: 14px;
  color: var(--color-heading);
  width: 100%;
  background: none;
  border-left: none;
  border-right: none;
  cursor: default;
  font-family: inherit;
  text-align: left;
}

.config-item:first-child {
  border-top: none;
}

.config-item:last-child {
  border-bottom: none;
}

.config-item--danger {
  cursor: pointer;
  color: #ef4444;
  transition: background 0.2s;
}

.config-item--danger:hover {
  background: rgba(239, 68, 68, 0.06);
}

.signout-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.config-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  padding: 3px 8px;
  border-radius: 10px;
}
</style>
