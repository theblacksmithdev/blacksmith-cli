<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  align?: 'start' | 'center'
}>(), {
  description: undefined,
  align: 'start',
})

defineSlots<{
  /** Buttons rendered on the right (or below, when centered). */
  actions?: () => unknown
}>()
</script>

<template>
  <div
    class="flex justify-between gap-4"
    :class="align === 'center'
      ? 'flex-col items-center text-center'
      : 'flex-col items-start sm:flex-row sm:items-end'"
  >
    <div class="flex flex-col gap-1.5">
      <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
        {{ title }}
      </h1>
      <p v-if="description" class="text-muted">
        {{ description }}
      </p>
    </div>
    <slot name="actions" />
  </div>
</template>
