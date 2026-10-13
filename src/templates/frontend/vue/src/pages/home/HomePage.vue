<script setup lang="ts">
import HeroSection from './components/HeroSection.vue'
import FeatureGrid from './components/FeatureGrid.vue'
import ExperiencePromo from './components/ExperiencePromo.vue'
</script>

<template>
  <div class="flex flex-col gap-14 pb-12 md:gap-20">
    <HeroSection />
    <FeatureGrid />
    <ExperiencePromo />
  </div>
</template>
