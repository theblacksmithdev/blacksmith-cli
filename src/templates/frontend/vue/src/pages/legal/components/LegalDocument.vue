<script setup lang="ts">
/**
 * Long-form legal page: a narrow reading column with numbered sections and
 * a contact line at the end.
 */
import USeparator from '@nuxt/ui/components/Separator.vue'
import StatusAlert from '@/shared/components/StatusAlert.vue'
import { SITE } from '@/shared/utils/site-config'
import type { LegalSection } from '../types'

defineProps<{
  title: string
  intro: string
  sections: LegalSection[]
}>()
</script>

<template>
  <article class="mx-auto flex max-w-3xl flex-col gap-10 py-4 md:py-8">
    <div class="flex flex-col gap-4">
      <h1 class="text-4xl leading-[1.1] font-semibold tracking-display text-highlighted md:text-5xl">
        {{ title }}
      </h1>
      <p v-if="SITE.legalUpdatedAt" class="text-sm text-muted">
        Last updated {{ SITE.legalUpdatedAt }}
      </p>
      <p class="text-lg leading-relaxed text-muted">
        {{ intro }}
      </p>
    </div>

    <StatusAlert
      status="neutral"
      title="Template text"
      message="This is a starting point, not legal advice. Replace it with terms reviewed for your product before you launch."
    />

    <USeparator />

    <ol class="flex flex-col gap-10">
      <li v-for="(section, index) in sections" :key="section.title" class="flex flex-col gap-3">
        <h2 class="text-xl font-semibold tracking-tight text-highlighted">
          {{ index + 1 }}. {{ section.title }}
        </h2>
        <p v-for="paragraph in section.paragraphs" :key="paragraph" class="leading-7 text-muted">
          {{ paragraph }}
        </p>
      </li>
    </ol>

    <USeparator />

    <p class="text-muted">
      Questions? Email us at
      <a :href="`mailto:${SITE.supportEmail}`" class="text-default underline underline-offset-4">{{ SITE.supportEmail }}</a>.
    </p>
  </article>
</template>
