<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue'
import UContainer from '@nuxt/ui/components/Container.vue'
import { useAuth } from '@/features/auth/composables/use-auth'
import { Path } from '@/router/paths'
import BrandLogo from '@/shared/components/BrandLogo.vue'
import ColorModeButton from '@/shared/components/ColorModeButton.vue'
import UserMenu from './UserMenu.vue'

const { isAuthenticated } = useAuth()
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-muted bg-default/80 backdrop-blur-lg backdrop-saturate-150">
    <UContainer class="max-w-6xl">
      <div class="flex h-16 items-center justify-between">
        <BrandLogo />

        <div class="flex items-center gap-2">
          <ColorModeButton />
          <UserMenu v-if="isAuthenticated" />
          <template v-else>
            <UButton
              :to="Path.Login"
              variant="ghost"
              color="neutral"
              size="sm"
            >
              Log in
            </UButton>
            <UButton :to="Path.Register" size="sm">
              Sign up
            </UButton>
          </template>
        </div>
      </div>
    </UContainer>
  </header>
</template>
