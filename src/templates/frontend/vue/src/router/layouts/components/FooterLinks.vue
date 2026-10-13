<script setup lang="ts">
import { Path } from '@/router/paths'
import TextLink from '@/shared/components/TextLink.vue'

const LINKS = [
  { label: 'Terms', to: Path.Terms },
  { label: 'Privacy', to: Path.Privacy },
  { label: 'Support', to: Path.Support },
]
</script>

<template>
  <nav class="flex items-center gap-5 text-sm">
    <TextLink
      v-for="link in LINKS"
      :key="link.to"
      :to="link.to"
      muted
    >
      {{ link.label }}
    </TextLink>
  </nav>
</template>
