<script setup lang="ts">
import { useRouter } from 'vue-router'
import UButton from '@nuxt/ui/components/Button.vue'
import { Path } from '@/router/paths'
import StatusPage from './StatusPage.vue'

const router = useRouter()

function goHome() {
  router.push(Path.Home)
}
</script>

<template>
  <StatusPage
    full-page
    code="404"
    title="Page not found"
    description="The page you're looking for doesn't exist or has been moved."
  >
    <template #actions>
      <UButton icon="i-lucide-arrow-left" @click="goHome">
        Back to Home
      </UButton>
    </template>
  </StatusPage>
</template>
