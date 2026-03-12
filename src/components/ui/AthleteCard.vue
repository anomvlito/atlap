<script setup lang="ts">
import type { TeamMember } from '@/data/mock'

defineProps<{
  member: TeamMember
}>()

const roleLabels: Record<TeamMember['role'], string> = {
  entrenador: 'Entrenador',
  kinesiologo: 'Kinesiólogo',
  nutricionista: 'Nutricionista',
  psicologo: 'Psicólogo',
}

const roleColors: Record<TeamMember['role'], string> = {
  entrenador: '#6366f1',
  kinesiologo: '#10b981',
  nutricionista: '#f59e0b',
  psicologo: '#a855f7',
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  return `Hace ${diffDays} días`
}
</script>

<template>
  <div class="athlete-card">
    <div class="athlete-card__header">
      <img :src="member.avatar" :alt="member.name" class="athlete-card__avatar" />
      <div>
        <p class="athlete-card__name">{{ member.name }}</p>
        <span
          class="athlete-card__role"
          :style="{ backgroundColor: `${roleColors[member.role]}20`, color: roleColors[member.role], borderColor: `${roleColors[member.role]}40` }"
        >
          {{ roleLabels[member.role] }}
        </span>
      </div>
    </div>
    <p class="athlete-card__notes">{{ member.notes }}</p>
    <p class="athlete-card__date">Última actividad: {{ formatDate(member.lastActivity) }}</p>
  </div>
</template>

<style scoped>
.athlete-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.athlete-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.athlete-card__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--glass-border);
}

.athlete-card__name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 4px;
}

.athlete-card__role {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  border: 1px solid;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.athlete-card__notes {
  font-size: 13px;
  color: var(--vt-c-text-dark-2);
  line-height: 1.5;
}

.athlete-card__date {
  font-size: 11px;
  color: var(--vt-c-text-dark-2);
  opacity: 0.6;
}
</style>
