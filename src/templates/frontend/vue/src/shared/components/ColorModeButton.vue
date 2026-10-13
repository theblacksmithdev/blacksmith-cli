<script setup lang="ts">
import { computed } from 'vue'
import UButton from '@nuxt/ui/components/Button.vue'
import { useColorMode } from '@/shared/composables/use-color-mode'

const { colorMode, toggleColorMode } = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
</script>

<template>
  <UButton
    :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    variant="ghost"
    color="neutral"
    size="sm"
    class="text-muted"
    @click="toggleColorMode"
  />
</template>
