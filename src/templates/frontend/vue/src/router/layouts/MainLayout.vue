<script setup lang="ts">
import { RouterView } from 'vue-router'
import UContainer from '@nuxt/ui/components/Container.vue'
import RouteErrorBoundary from '@/router/RouteErrorBoundary.vue'
import { SITE } from '@/shared/utils/site-config'
import SiteHeader from './components/SiteHeader.vue'
import FooterLinks from './components/FooterLinks.vue'

const year = new Date().getFullYear()
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <SiteHeader />

    <main class="flex-1">
      <UContainer class="max-w-6xl py-8 md:py-12">
        <RouteErrorBoundary>
          <RouterView />
        </RouteErrorBoundary>
      </UContainer>
    </main>

    <footer class="border-t border-muted">
      <UContainer class="max-w-6xl">
        <div class="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <p class="text-sm text-muted">
            &copy; {{ year }} {{ SITE.name }}
          </p>
          <FooterLinks />
        </div>
      </UContainer>
    </footer>
  </div>
</template>
