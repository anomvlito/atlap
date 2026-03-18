import { defineStore } from 'pinia'
import { useUser, useAuth } from '@clerk/vue'
import { computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const { user, isLoaded } = useUser()
  const { isSignedIn, signOut } = useAuth()

  const displayName = computed(() =>
    user.value?.fullName ?? user.value?.emailAddresses[0]?.emailAddress ?? 'Atleta'
  )

  const avatarUrl = computed(() => user.value?.imageUrl ?? null)

  const email = computed(() => user.value?.emailAddresses[0]?.emailAddress ?? '')

  const clerkId = computed(() => user.value?.id ?? null)

  return {
    user,
    isLoaded,
    isSignedIn,
    signOut,
    displayName,
    avatarUrl,
    email,
    clerkId,
  }
})
