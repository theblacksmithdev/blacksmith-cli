<script setup lang="ts">
import LegalDocument from './components/LegalDocument.vue'
import { PRIVACY_INTRO, PRIVACY_SECTIONS } from './content/privacy'
</script>

<template>
  <LegalDocument title="Privacy Policy" :intro="PRIVACY_INTRO" :sections="PRIVACY_SECTIONS" />
</template>
