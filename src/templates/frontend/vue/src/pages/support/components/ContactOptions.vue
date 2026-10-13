<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue'
import { Path } from '@/router/paths'
import InfoCard from '@/shared/components/InfoCard.vue'
import { API_DOCS_URL } from '@/shared/utils/api-url'
import { SITE } from '@/shared/utils/site-config'
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <InfoCard
      icon="i-lucide-mail"
      title="Email us"
      description="Questions, bugs or account requests. We usually reply within one business day."
    >
      <UButton :to="`mailto:${SITE.supportEmail}`" size="sm">
        {{ SITE.supportEmail }}
      </UButton>
    </InfoCard>

    <InfoCard
      icon="i-lucide-key-round"
      title="Account access"
      description="Locked out? Reset your password and get back in a couple of minutes."
    >
      <UButton
        :to="Path.ForgotPassword"
        variant="outline"
        color="neutral"
        size="sm"
      >
        Reset password
      </UButton>
    </InfoCard>

    <InfoCard
      icon="i-lucide-book-open"
      title="API reference"
      description="Building an integration? Every endpoint is documented with examples."
    >
      <UButton
        :to="API_DOCS_URL"
        target="_blank"
        variant="outline"
        color="neutral"
        size="sm"
        trailing-icon="i-lucide-arrow-up-right"
      >
        View API docs
      </UButton>
    </InfoCard>
  </div>
</template>
