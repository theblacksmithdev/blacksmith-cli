<script setup lang="ts">
/**
 * Minimal, centered auth shell: logo on top, a single narrow form column,
 * and quiet legal links underneath.
 */
import { RouterView } from 'vue-router'
import UContainer from '@nuxt/ui/components/Container.vue'
import RouteErrorBoundary from '@/router/RouteErrorBoundary.vue'
import BrandLogo from '@/shared/components/BrandLogo.vue'
import ColorModeButton from '@/shared/components/ColorModeButton.vue'
import FooterLinks from './components/FooterLinks.vue'
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-default">
    <UContainer class="max-w-6xl">
      <div class="flex h-16 items-center justify-between">
        <BrandLogo />
        <ColorModeButton />
      </div>
    </UContainer>

    <div class="flex flex-1 items-center justify-center px-6 py-12">
      <div class="w-full max-w-sm">
        <RouteErrorBoundary>
          <RouterView />
        </RouteErrorBoundary>
      </div>
    </div>

    <div class="flex justify-center py-8">
      <FooterLinks />
    </div>
  </div>
</template>
