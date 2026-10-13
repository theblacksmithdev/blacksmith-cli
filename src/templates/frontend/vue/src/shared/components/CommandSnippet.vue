<script setup lang="ts">
/**
 * A terminal command shown as a quiet monospace pill.
 */
import UIcon from '@nuxt/ui/components/Icon.vue'

defineProps<{
  command: string
}>()
</script>

<template>
  <div class="flex w-fit max-w-full items-center gap-2 overflow-x-auto rounded-full bg-elevated px-3 py-2 text-muted">
    <UIcon name="i-lucide-terminal" class="size-3.5 shrink-0" />
    <code class="font-mono text-xs whitespace-nowrap text-default">{{ command }}</code>
  </div>
</template>
