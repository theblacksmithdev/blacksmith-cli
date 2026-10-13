<script setup lang="ts">
/**
 * Blacksmith Experience callout. Delete this component (and its use in
 * HomePage.vue) when you're ready to make the home page your own.
 */
import UButton from '@nuxt/ui/components/Button.vue'
import BrandMark from '@/shared/components/BrandMark.vue'

const BLACKSMITH_EXPERIENCE_URL =
  'https://www.blacksmithexp.dev/?utm_source=blacksmith-cli&utm_medium=generated-app'
</script>

<template>
  <section
    class="mx-auto w-full max-w-5xl rounded-2xl bg-ink px-7 py-10 text-white md:px-12 md:py-14 dark:border dark:border-default dark:bg-muted"
    style="background-image: radial-gradient(640px circle at 100% 0%, rgba(255, 255, 255, 0.1), transparent 65%)"
  >
    <div class="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
      <div class="flex max-w-2xl flex-col gap-4">
        <div class="flex items-center gap-2 text-white/70">
          <BrandMark class="size-4" />
          <span class="text-sm font-medium tracking-tight">Blacksmith Experience</span>
        </div>

        <h2 class="text-3xl leading-[1.05] font-semibold tracking-display md:text-5xl">
          Prove you can actually build.
        </h2>

        <p class="text-white/70 md:text-lg">
          Build real products start to finish, defend every decision you make, and walk away
          with work that shows you're ready.
        </p>
      </div>

      <UButton
        :to="BLACKSMITH_EXPERIENCE_URL"
        target="_blank"
        size="lg"
        trailing-icon="i-lucide-arrow-up-right"
        class="shrink-0 bg-white px-6 text-ink hover:bg-white/90"
      >
        Start building
      </UButton>
    </div>
  </section>
</template>
