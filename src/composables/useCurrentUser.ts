import { ref, computed, watch } from 'vue';
import { useUser } from '@clerk/vue';
import { neon } from '@neondatabase/serverless';
import { getDisciplineConfig, type SportGroup } from '@/types/discipline';

let _sql: ReturnType<typeof neon> | null = null;
function getSql() {
  if (!_sql) {
    const url = import.meta.env.VITE_DATABASE_URL;
    if (!url) throw new Error('VITE_DATABASE_URL no está configurada');
    _sql = neon(url);
  }
  return _sql;
}

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

  async function fetchUser(clerkId: string): Promise<DbUser | null> {
    const rows = (await getSql()`
      SELECT id, clerk_id, email, full_name, role, birth_date, height, gender, discipline, onboarded, created_at, updated_at
      FROM users WHERE clerk_id = ${clerkId} LIMIT 1
    `) as Record<string, unknown>[];
    if (!rows.length) return null;
    const r = rows[0] as Record<string, unknown>;
    return {
      id: r.id as string,
      clerkId: r.clerk_id as string,
      email: r.email as string,
      fullName: r.full_name as string | null,
      role: r.role as DbUser['role'],
      birthDate: r.birth_date as string | null,
      height: r.height as number | null,
      gender: r.gender as DbUser['gender'],
      discipline: r.discipline as string | null,
      onboarded: r.onboarded as boolean,
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string
    };
  }

  async function refreshUser() {
    if (!isLoaded.value || !user.value) return;
    isChecking.value = true;
    try {
      dbUser.value = await fetchUser(user.value.id);
    } finally {
      isChecking.value = false;
    }
  }

  async function saveProfile(data: ProfileData) {
    if (!user.value) throw new Error('No hay usuario autenticado');

    const clerkUser = user.value;
    const email = clerkUser.primaryEmailAddress?.emailAddress ?? '';

    const birthDate = data.birthDate || null;
    const height = data.height || null;
    await getSql()`
      INSERT INTO users (clerk_id, email, full_name, birth_date, height, gender, discipline, onboarded)
      VALUES (${clerkUser.id}, ${email}, ${data.fullName}, ${birthDate}, ${height}, ${data.gender}, ${data.discipline}, TRUE)
      ON CONFLICT (clerk_id) DO UPDATE SET
        full_name  = EXCLUDED.full_name,
        birth_date = EXCLUDED.birth_date,
        height     = EXCLUDED.height,
        gender     = EXCLUDED.gender,
        discipline = EXCLUDED.discipline,
        onboarded  = TRUE,
        updated_at = NOW()
    `;

    await refreshUser();
  }

  // Watch: cuando Clerk carga el usuario, buscar en DB (solo una vez por clerkId)
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
