<script setup lang="ts">
import { computed } from 'vue'
import USeparator from '@nuxt/ui/components/Separator.vue'
import { useAuth } from '@/features/auth/composables/use-auth'
import { displayName } from '@/features/auth/utils/display-name'
import PageHeader from '@/shared/components/PageHeader.vue'
import StackOverview from './components/StackOverview.vue'

const { user } = useAuth()

const greeting = computed(() => `Welcome back, ${displayName(user.value, 'there')}.`)
</script>

<template>
  <div class="flex flex-col gap-8">
    <PageHeader title="Dashboard" :description="greeting" />
    <USeparator />
    <StackOverview />
  </div>
</template>
