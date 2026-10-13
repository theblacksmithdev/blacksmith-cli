<script setup lang="ts">
import UBadge from '@nuxt/ui/components/Badge.vue'
import UButton from '@nuxt/ui/components/Button.vue'
import { useAuth } from '@/features/auth/composables/use-auth'
import { Path } from '@/router/paths'
import { API_DOCS_URL } from '@/shared/utils/api-url'
import { SITE } from '@/shared/utils/site-config'

const { isAuthenticated } = useAuth()
</script>

<template>
  <section class="flex flex-col items-center gap-6 pt-12 pb-4 text-center md:pt-20">
    <UBadge
      variant="outline"
      color="neutral"
      size="lg"
      class="px-3 text-muted"
    >
      Your app is ready
    </UBadge>

    <h1 class="text-5xl leading-none font-semibold tracking-display text-highlighted md:text-7xl">
      {{ SITE.name }}
    </h1>

    <p class="max-w-xl text-lg text-muted md:text-xl">
      A full-stack foundation with auth, a typed API client, and a design system — ready for your first feature.
    </p>

    <div class="flex flex-col gap-3 pt-2 sm:flex-row">
      <UButton
        :to="isAuthenticated ? Path.Dashboard : Path.Login"
        size="lg"
        trailing-icon="i-lucide-arrow-right"
        class="px-6"
      >
        {{ isAuthenticated ? 'Open dashboard' : 'Get started' }}
      </UButton>
      <UButton
        :to="API_DOCS_URL"
        target="_blank"
        size="lg"
        variant="outline"
        color="neutral"
        trailing-icon="i-lucide-arrow-up-right"
        class="px-6"
      >
        API docs
      </UButton>
    </div>
  </section>
</template>
