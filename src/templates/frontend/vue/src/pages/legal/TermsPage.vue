<script setup lang="ts">
import LegalDocument from './components/LegalDocument.vue'
import { TERMS_INTRO, TERMS_SECTIONS } from './content/terms'
</script>

<template>
  <LegalDocument title="Terms of Service" :intro="TERMS_INTRO" :sections="TERMS_SECTIONS" />
</template>
