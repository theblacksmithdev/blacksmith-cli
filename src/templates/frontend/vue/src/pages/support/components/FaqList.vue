<script setup lang="ts">
import UAccordion from '@nuxt/ui/components/Accordion.vue'
import { FAQS } from '../content/faqs'
</script>

<template>
  <section class="flex flex-col gap-4">
    <h2 class="text-2xl font-semibold tracking-tight text-highlighted">
      Frequently asked questions
    </h2>
    <UAccordion
      :items="FAQS"
      label-key="question"
      value-key="question"
      :ui="{ trigger: 'py-5 text-base font-medium', body: 'pb-5 text-muted leading-relaxed' }"
    >
      <template #body="{ item }">
        {{ item.answer }}
      </template>
    </UAccordion>
  </section>
</template>
