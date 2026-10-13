<script setup lang="ts">
import PageHeader from '@/shared/components/PageHeader.vue'
import ContactOptions from './components/ContactOptions.vue'
import FaqList from './components/FaqList.vue'
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-14 py-4 md:py-8">
    <PageHeader
      align="center"
      title="How can we help?"
      description="Reach the team, get back into your account, or find answers below."
    />
    <ContactOptions />
    <FaqList />
  </div>
</template>
