<script setup lang="ts">
/**
 * Inline status message — form errors, request failures, confirmations.
 */
import UAlert from '@nuxt/ui/components/Alert.vue'
import { STATUS_ICONS, type AlertStatus } from '@/shared/utils/status-icons'

withDefaults(defineProps<{
  message: string
  title?: string
  status?: AlertStatus
}>(), {
  title: undefined,
  status: 'error',
})
</script>

<template>
  <UAlert
    :color="status"
    variant="subtle"
    :icon="STATUS_ICONS[status]"
    :title="title ?? message"
    :description="title ? message : undefined"
  />
</template>
