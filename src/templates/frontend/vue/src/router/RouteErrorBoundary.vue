<script setup lang="ts">
/**
 * Catches an error thrown while rendering a page and shows a way out,
 * instead of leaving the layout blank.
 */
import { onErrorCaptured, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import UButton from '@nuxt/ui/components/Button.vue'
import StatusPage from '@/shared/components/StatusPage.vue'

const error = ref<Error | null>(null)
const route = useRoute()

onErrorCaptured((caught) => {
  error.value = caught instanceof Error ? caught : new Error(String(caught))
  // Stop here: the layout around the page keeps working
  return false
})

// Navigating away clears the error
watch(() => route.fullPath, () => (error.value = null))

function reload() {
  window.location.reload()
}
</script>

<template>
  <StatusPage
    v-if="error"
    title="Something went wrong"
    :description="error.message || 'An unexpected error occurred.'"
  >
    <template #actions>
      <UButton icon="i-lucide-refresh-cw" @click="reload">
        Reload Page
      </UButton>
    </template>
  </StatusPage>
  <slot v-else />
</template>
