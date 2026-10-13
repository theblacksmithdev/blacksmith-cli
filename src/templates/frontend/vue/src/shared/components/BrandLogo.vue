<script setup lang="ts">
/**
 * App mark + name, linking home.
 */
import { RouterLink } from 'vue-router'
import { Path } from '@/router/paths'
import { SITE } from '@/shared/utils/site-config'
import BrandMark from './BrandMark.vue'
</script>

<template>
  <RouterLink :to="Path.Home" class="flex items-center gap-2.5 text-default transition-opacity hover:opacity-80">
    <BrandMark class="size-7 text-primary" />
    <span class="font-semibold tracking-tight">{{ SITE.name }}</span>
  </RouterLink>
</template>
