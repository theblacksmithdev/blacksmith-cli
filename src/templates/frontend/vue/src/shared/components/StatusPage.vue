<script setup lang="ts">
/**
 * Centered full-bleed message for 404s, crashes, and access denials.
 */
withDefaults(defineProps<{
  /** Large display line, e.g. "404". */
  code?: string
  title: string
  description?: string
  /** Fill the viewport (standalone pages) or just the content area. */
  fullPage?: boolean
}>(), {
  code: undefined,
  description: undefined,
  fullPage: false,
})

defineSlots<{
  /** Buttons that get the user unstuck. */
  actions?: () => unknown
}>()
</script>

<template>
  <div class="flex items-center justify-center px-6 py-16" :class="fullPage ? 'min-h-dvh' : 'min-h-[60vh]'">
    <div class="flex max-w-md flex-col items-center gap-5 text-center">
      <h1 v-if="code" class="text-6xl leading-none font-semibold tracking-display text-highlighted md:text-7xl">
        {{ code }}
      </h1>
      <div class="flex flex-col gap-2">
        <component :is="code ? 'h2' : 'h1'" class="text-2xl font-semibold tracking-tight text-highlighted">
          {{ title }}
        </component>
        <p v-if="description" class="text-muted">
          {{ description }}
        </p>
      </div>
      <div v-if="$slots.actions" class="flex gap-3 pt-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
