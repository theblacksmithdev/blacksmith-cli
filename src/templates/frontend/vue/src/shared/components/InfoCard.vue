<script setup lang="ts">
import UBadge from '@nuxt/ui/components/Badge.vue'
import UCard from '@nuxt/ui/components/Card.vue'
import UIcon from '@nuxt/ui/components/Icon.vue'

defineProps<{
  /** An Iconify name, e.g. `i-lucide-rocket`. */
  icon: string
  title: string
  description: string
  /** Small pill in the top-right corner, e.g. the technology name. */
  badge?: string
}>()

defineSlots<{
  /** Rendered at the bottom — a button, link, or command snippet. */
  default?: () => unknown
}>()
</script>

<template>
  <UCard variant="outline" class="interactive-card" :ui="{ body: 'flex flex-col gap-4' }">
    <div class="flex items-start justify-between">
      <div class="flex size-9 items-center justify-center rounded-lg bg-elevated text-default">
        <UIcon :name="icon" class="size-4" />
      </div>
      <UBadge
        v-if="badge"
        variant="outline"
        color="neutral"
        size="sm"
      >
        {{ badge }}
      </UBadge>
    </div>

    <div class="flex flex-col gap-1.5">
      <h3 class="font-semibold tracking-tight text-highlighted">
        {{ title }}
      </h3>
      <p class="text-sm text-muted">
        {{ description }}
      </p>
    </div>

    <div v-if="$slots.default">
      <slot />
    </div>
  </UCard>
</template>
