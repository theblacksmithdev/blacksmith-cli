<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { DropdownMenuItem } from '@nuxt/ui'
import UAvatar from '@nuxt/ui/components/Avatar.vue'
import UButton from '@nuxt/ui/components/Button.vue'
import UDropdownMenu from '@nuxt/ui/components/DropdownMenu.vue'
import { useAuth } from '@/features/auth/composables/use-auth'
import { displayName } from '@/features/auth/utils/display-name'
import { Path } from '@/router/paths'

const { user, logout } = useAuth()
const router = useRouter()

const name = computed(() => user.value?.displayName || 'User')

async function handleLogout() {
  await logout()
  await router.push(Path.Login)
}

const items = computed<DropdownMenuItem[][]>(() => [
  [{ label: name.value, slot: 'account', type: 'label' }],
  [
    { label: 'Profile', icon: 'i-lucide-user' },
    { label: 'Settings', icon: 'i-lucide-settings' },
  ],
  [{ label: 'Sign Out', icon: 'i-lucide-log-out', onSelect: handleLogout }],
])
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'end' }" :ui="{ content: 'min-w-60' }">
    <UButton
      variant="ghost"
      color="neutral"
      class="rounded-full p-0"
      aria-label="Account menu"
    >
      <UAvatar :alt="displayName(user, 'User')" size="sm" />
    </UButton>

    <template #account>
      <div class="min-w-0 text-left">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ name }}
        </p>
        <p class="truncate text-xs text-muted">
          {{ user?.email }}
        </p>
      </div>
    </template>
  </UDropdownMenu>
</template>
