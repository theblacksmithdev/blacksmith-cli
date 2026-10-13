<script setup lang="ts">
/**
 * Page links under a paginated list; hidden while everything fits on one page.
 */
import UPagination from '@nuxt/ui/components/Pagination.vue'
import { PAGE_SIZE } from '@/shared/utils/pagination'

const page = defineModel<number>('page', { required: true })

defineProps<{
  /** Results across every page, the list endpoint's `count`. */
  total: number
}>()
</script>

<template>
  <UPagination
    v-if="total > PAGE_SIZE"
    v-model:page="page"
    :total="total"
    :items-per-page="PAGE_SIZE"
    class="self-center"
  />
</template>
