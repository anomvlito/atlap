import { ref, computed, watch } from 'vue';
import { useUser, useAuth } from '@clerk/vue';
import { getDisciplineConfig, type SportGroup } from '@/types/discipline';

export interface DbUser {
  id: string;
  clerkId: string;
  email: string;
  fullName: string | null;
  role: 'athlete' | 'coach' | 'org_admin';
  birthDate: string | null;
  height: number | null;
  gender: 'masculino' | 'femenino' | 'otro' | null;
  discipline: string | null;
  onboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileData {
  fullName: string;
  birthDate: string;
  height: number | null;
  gender: 'masculino' | 'femenino' | 'otro';
  discipline: string;
}

const dbUser = ref<DbUser | null>(null);
const isChecking = ref(false);
const checkedClerkId = ref<string | null>(null);

export function useCurrentUser() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const isOnboarded = computed(() => dbUser.value?.onboarded === true);

  const userDisciplines = computed<string[]>(() => {
    const disc = dbUser.value?.discipline;
    if (!disc) return [];
    return disc
      .split(',')
      .map(d => d.trim())
      .filter(Boolean);
  });

  const sportGroup = computed<SportGroup | null>(() => {
    const first = userDisciplines.value[0];
    if (!first) return null;
    return getDisciplineConfig(first)?.group ?? null;
  });

  async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await getToken.value();
    const res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {})
      }
    });
    const json = (await res.json()) as { success: boolean; data?: T; error?: string };
    if (!json.success) throw new Error(json.error ?? 'Error desconocido');
    return json.data as T;
  }

  async function refreshUser() {
    if (!isLoaded.value || !user.value) return;
    isChecking.value = true;
    try {
      dbUser.value = await apiRequest<DbUser>('/api/users/me');
    } catch {
      dbUser.value = null;
    } finally {
      isChecking.value = false;
    }
  }

  async function saveProfile(data: ProfileData) {
    if (!user.value) throw new Error('No hay usuario autenticado');

    const clerkUser = user.value;
    const email = clerkUser.primaryEmailAddress?.emailAddress ?? '';

    // Sync: crea el usuario si no existe
    await apiRequest('/api/users/sync', {
      method: 'POST',
      body: JSON.stringify({ email, fullName: data.fullName })
    });

    // Actualiza el perfil
    await apiRequest('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        fullName: data.fullName,
        birthDate: data.birthDate || null,
        height: data.height || null,
        gender: data.gender,
        discipline: data.discipline,
        onboarded: true
      })
    });

    await refreshUser();
  }

  watch(
    [isLoaded, user],
    async ([loaded, clerkUser]) => {
      if (!loaded) return;
      if (!clerkUser) {
        dbUser.value = null;
        checkedClerkId.value = null;
        return;
      }
      if (checkedClerkId.value === clerkUser.id) return;
      checkedClerkId.value = clerkUser.id;
      isChecking.value = true;
      // Garantiza que el usuario exista en DB en cada inicio de sesión
      try {
        const email = clerkUser.primaryEmailAddress?.emailAddress ?? '';
        const fullName = clerkUser.fullName ?? '';
        await apiRequest('/api/users/sync', {
          method: 'POST',
          body: JSON.stringify({ email, fullName })
        });
      } catch {
        /* puede que ya exista */
      }
      await refreshUser();
    },
    { immediate: true }
  );

  return {
    dbUser,
    isChecking,
    isOnboarded,
    userDisciplines,
    sportGroup,
    refreshUser,
    saveProfile
  };
}
