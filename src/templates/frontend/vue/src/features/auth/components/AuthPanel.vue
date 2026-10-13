<script setup lang="ts">
/**
 * Shared frame for every auth page: centered heading, status messages,
 * the form itself, and secondary links.
 */
import PageHeader from '@/shared/components/PageHeader.vue'
import StatusAlert from '@/shared/components/StatusAlert.vue'

withDefaults(defineProps<{
  title: string
  description: string
  /** Error from the auth adapter, shown above the form. */
  error?: string | null
  /** Success confirmation, shown above the form. */
  notice?: string | null
}>(), {
  error: null,
  notice: null,
})

defineSlots<{
  default: () => unknown
  /** Links under the form ("Don't have an account? Sign up"). */
  footer?: () => unknown
}>()
</script>

<template>
  <div class="flex flex-col gap-8">
    <PageHeader align="center" :title="title" :description="description" />

    <div v-if="error || notice" class="flex flex-col gap-3">
      <StatusAlert v-if="error" :message="error" />
      <StatusAlert v-if="notice" status="success" :message="notice" />
    </div>

    <slot />

    <div v-if="$slots.footer" class="flex flex-col items-center gap-2 text-sm text-muted">
      <slot name="footer" />
    </div>
  </div>
</template>
