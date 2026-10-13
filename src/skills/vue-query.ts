import type { Skill, SkillContext } from './types.js'

export const vueQuerySkill: Skill = {
  id: 'vue-query',
  name: 'TanStack Vue Query',
  description: 'API data fetching conventions using the useApiQuery and useApiMutation composables.',

  render(_ctx: SkillContext): string {
    return `## TanStack Vue Query — API Data Fetching

> **RULE: Always use \`useApiQuery\` and \`useApiMutation\` instead of raw \`useQuery\` / \`useMutation\`.**
> These composables live in \`@/shared/composables/\` and handle DRF error parsing, smart retry, and cache invalidation.

### Queries — \`useApiQuery\`

Import: \`import { useApiQuery } from '@/shared/composables/use-api-query'\`

Wraps \`useQuery\` with:
- **Smart retry** — skips 400, 401, 403, 404, 405, 409, 422 (retries others up to 2 times), through \`shouldRetryRequest\` in \`@/shared/utils/api-error\`
- **Parsed errors** — \`errorMessage\` and \`apiError\`, computed from the query's \`error\`

> **Pass the options as a getter** whenever they depend on reactive state. The getter re-runs when that state changes, and the query refetches. A plain object is read once: paging would show page 1 forever.

\`\`\`ts
import { ref } from 'vue'
import { postsListOptions, postsRetrieveOptions } from '@/api/generated/@tanstack/vue-query.gen'

// List query that follows the page
const page = ref(1)
const { data, isLoading, errorMessage } = useApiQuery(() => ({
  ...postsListOptions({ query: { page: page.value } }),
}))

// With select to reshape the response (typed from the generated client)
const { data } = useApiQuery(() => ({
  ...postsListOptions({ query: { page: page.value } }),
  select: (data) => ({ posts: data.results, total: data.count }),
}))

// Detail query, skipped until there is an id
const props = defineProps<{ id: string }>()
const { data: post } = useApiQuery(() => ({
  ...postsRetrieveOptions({ path: { id: props.id } }),
  enabled: !!props.id,
}))
\`\`\`

**Returns** everything \`useQuery\` returns (\`data\`, \`isLoading\`, \`error\`, \`refetch\`, …, all refs) plus:
| Field | Type | Description |
|-------|------|-------------|
| \`errorMessage\` | \`ComputedRef<string \\| null>\` | Human-readable error message |
| \`apiError\` | \`ComputedRef<ApiError \\| null>\` | Structured error with \`status\`, \`message\`, \`fieldErrors\` |

### Mutations — \`useApiMutation\`

Import: \`import { useApiMutation } from '@/shared/composables/use-api-mutation'\`

Wraps \`useMutation\` with:
- **DRF error parsing** — \`fieldErrors\`, \`errorMessage\`, \`apiError\`, computed from the mutation's \`error\` (no local state)
- **Cache invalidation** — \`invalidateKeys\` are invalidated on success. Pass a getter when a key depends on reactive state; it is read at that moment

\`\`\`ts
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  postsCreateMutation,
  postsUpdateMutation,
  postsListQueryKey,
  postsRetrieveQueryKey,
} from '@/api/generated/@tanstack/vue-query.gen'

const createPost = useApiMutation({
  ...postsCreateMutation(),
  invalidateKeys: [postsListQueryKey()],
})

// The detail key depends on the id, so it is a getter
function useUpdatePost(id: MaybeRefOrGetter<string>) {
  return useApiMutation({
    ...postsUpdateMutation(),
    invalidateKeys: () => [postsListQueryKey(), postsRetrieveQueryKey({ path: { id: toValue(id) } })],
  })
}

// Trigger it, with per-call callbacks
createPost.mutate({ body: { title: 'Hello' } }, { onSuccess: () => (open.value = false) })
\`\`\`

Prefer \`mutate\` with \`onSuccess\` over \`await mutateAsync\`: \`mutateAsync\` rejects on an API error, and an unhandled rejection is a console error on top of the error the UI already shows.

**Returns** everything \`useMutation\` returns (\`mutate\`, \`isPending\`, \`reset\`, …) plus \`fieldErrors\`, \`errorMessage\` and \`apiError\` as computed refs.

### Using the Results in a Template

Refs at the top level of \`<script setup>\` unwrap in the template; refs inside an object do not. Destructure, and rename where two mutations would clash:

\`\`\`vue
<script setup lang="ts">
const {
  mutate: createPost,
  isPending: isCreating,
  errorMessage: createError,
  fieldErrors: createFieldErrors,
  reset: resetCreate,
} = useCreatePost()
</script>

<template>
  <StatusAlert v-if="createError" :message="createError" />
  <PostForm :is-submitting="isCreating" :field-errors="createFieldErrors" @submit="(body) => createPost({ body })" />
</template>
\`\`\`

Call \`reset()\` before reopening a form, so the previous attempt's errors are gone.

### Error Display Patterns

- **Query error on a page**: \`<StatusAlert v-if="errorMessage" :message="errorMessage" />\`
- **Mutation error above a form**: pass \`errorMessage\` to the form, which renders a \`StatusAlert\`
- **Field errors under fields**: pass \`fieldErrors\` to the form; it hands them to \`UForm\` with \`form.setErrors(toFormErrors(fieldErrors))\`. See the \`nuxt-ui-forms\` skill

### Creating Resource Composable Files

> **RULE: All API composables live in \`src/api/composables/<resource>/\` — never in page-level \`composables/\` folders.**
> Page-level \`composables/\` are for UI logic only (form state, filters, pagination). API data access is centralized in \`src/api/composables/\`.

\`blacksmith make:resource Post\` creates these; follow the same shape for anything written by hand.

**\`src/api/composables/<resources>/index.ts\`** — re-exports the composables.

**\`src/api/composables/<resources>/use-<resources>-query.ts\`** — list and detail queries:
\`\`\`ts
import { toValue, type MaybeRefOrGetter } from 'vue'
import { useApiQuery } from '@/shared/composables/use-api-query'
import { postsListOptions, postsRetrieveOptions } from '@/api/generated/@tanstack/vue-query.gen'

export interface PostsParams {
  page?: number
  search?: string
  ordering?: string
}

export function usePosts(params: MaybeRefOrGetter<PostsParams> = {}) {
  return useApiQuery(() => {
    const { page = 1, search, ordering = '-created_at' } = toValue(params)
    return {
      ...postsListOptions({ query: { page, search, ordering } }),
      select: (data) => ({ posts: data.results, total: data.count, hasNext: !!data.next, hasPrev: !!data.previous }),
    }
  })
}

export function useGetPost(id: MaybeRefOrGetter<string>) {
  return useApiQuery(() => ({
    ...postsRetrieveOptions({ path: { id: toValue(id) } }),
    enabled: !!toValue(id),
  }))
}
\`\`\`

**\`src/api/composables/<resources>/use-<resource>-mutations.ts\`** — \`useCreatePost\`, \`useUpdatePost(id)\`, \`useDeletePost\`, each a \`useApiMutation\` with its \`invalidateKeys\`.

### Key Rules

1. **Never use raw \`useQuery\` or \`useMutation\`** — always go through \`useApiQuery\` / \`useApiMutation\`
2. **Never keep API error state in a \`ref\`** — it is computed from the query's or mutation's \`error\`
3. **Pass reactive inputs as getters** (\`() => ({ page: page.value })\`) or \`MaybeRefOrGetter\` parameters read with \`toValue\` — never as a value captured once
4. **Always pass \`invalidateKeys\`** on mutations that change data
5. **Always prefer generated API client code** — the options, mutations, types and query keys in \`@/api/generated/@tanstack/vue-query.gen\` and \`@/api/generated\`. Write a manual \`queryFn\` only when no generated code exists for the endpoint
6. **Use \`select\`** to reshape responses in the composable, not in components
7. **Use \`enabled\`** for conditional queries
8. **Spread generated options first** (\`...postsListOptions()\`), then add overrides — this keeps the generated \`queryKey\` and \`queryFn\`
`
  },
}
