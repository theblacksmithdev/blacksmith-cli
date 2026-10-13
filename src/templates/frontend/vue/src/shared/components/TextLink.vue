<script setup lang="ts">
/**
 * A text link that navigates client-side with the router.
 */
import { RouterLink, type RouteLocationRaw } from 'vue-router'

defineProps<{
  to: RouteLocationRaw
  /** Quiet grey link, for secondary actions and footers. */
  muted?: boolean
}>()
</script>

<template>
  <RouterLink
    :to="to"
    class="transition-colors"
    :class="muted ? 'text-muted hover:text-default' : 'font-medium text-highlighted hover:underline'"
  >
    <slot />
  </RouterLink>
</template>
