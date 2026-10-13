import type { Skill, SkillContext } from './types.js'

export const blacksmithComposablesSkill: Skill = {
  id: 'blacksmith-composables',
  name: 'Custom Composables',
  description: 'The scaffolded Vue composables, VueUse, and when and where to write a new composable.',

  render(_ctx: SkillContext): string {
    return `## Custom Composables

> **RULE: Reuse before writing.** Before creating a composable, check the project's shared composables, then **VueUse** (\`@vueuse/core\`, already a dependency), then Nuxt UI's composables. Write your own only when none of them fits.

A composable is a function named \`useX\` that uses Vue's reactivity (\`ref\`, \`computed\`, \`watch\`, lifecycle hooks) and is called from \`<script setup>\` or another composable. Plain functions without reactivity are utils and go in \`utils/\`.

### Scaffolded Project Composables

| Composable | File | Description |
|------------|------|-------------|
| \`useApiQuery\` | \`src/shared/composables/use-api-query.ts\` | \`useQuery\` with DRF error parsing (\`errorMessage\`, \`apiError\`) and smart retry; takes options or a **getter** of options |
| \`useApiMutation\` | \`src/shared/composables/use-api-mutation.ts\` | \`useMutation\` with \`fieldErrors\`, \`errorMessage\`, \`apiError\`, and \`invalidateKeys\` (a list or a getter read on success) |
| \`useColorMode\` | \`src/shared/composables/use-color-mode.ts\` | \`{ colorMode, setColorMode, toggleColorMode }\` over the store in \`src/shared/utils/color-mode.ts\` (follows the OS until the user picks) |
| \`useAuth\` | \`src/features/auth/composables/use-auth.ts\` | Auth state and actions — see the \`vue-auth\` skill |
| \`use<Resource>s\`, \`useGet<Resource>\`, \`useCreate<Resource>\`, … | \`src/api/composables/<resource>/\` | Per-resource queries and mutations — see the \`vue-query\` skill |

Shared utils the composables build on, in \`src/shared/utils/\`: \`api-error.ts\` (\`parseApiError\`, \`shouldRetryRequest\`), \`color-mode.ts\`, \`form-errors.ts\` (\`toFormErrors\`), \`format-date.ts\`, \`pagination.ts\` (\`PAGE_SIZE\`), \`status-icons.ts\`.

### VueUse First

Import each function explicitly (auto-imports are off):

| Need | VueUse |
|------|--------|
| Debounce a value (search boxes) | \`refDebounced(source, 300)\` |
| Debounce a function | \`useDebounceFn(fn, 300)\` |
| Persist a value | \`useLocalStorage('key', default)\` |
| Breakpoints | \`useBreakpoints(breakpointsTailwind)\` |
| Media query | \`useMediaQuery('(min-width: 768px)')\` |
| Clipboard | \`useClipboard()\` → \`{ copy, copied }\` |
| Click outside | \`onClickOutside(target, handler)\` |
| Interval / timeout | \`useIntervalFn\`, \`useTimeoutFn\` |
| Previous value | \`usePrevious(source)\` |
| Toggle | \`useToggle()\` |

Do not use VueUse's \`useColorMode\` / \`useDark\`: the project's \`useColorMode\` owns the \`dark\` class, and a second owner would fight it.

### Nuxt UI Composables

From \`'@nuxt/ui/composables'\`:
- \`useToast()\` — \`toast.add({ title, description, color: 'success' })\`
- \`useOverlay()\` — open a modal or slideover component programmatically
- \`defineShortcuts({ meta_k: () => ... })\` — keyboard shortcuts

### Where a New Composable Goes

| Scope | Folder |
|-------|--------|
| API data (queries, mutations) | \`src/api/composables/<resource>/\` — never anywhere else |
| One page's UI logic (filters, selection, modal state) | \`src/pages/<page>/composables/\` |
| One feature's logic | \`src/features/<feature>/composables/\` |
| Used across the app | \`src/shared/composables/\` |

File names are kebab-case (\`use-post-filters.ts\`), one composable per file, with a test in \`__tests__/\` beside it.

### Writing One

\`\`\`ts
// src/pages/posts/composables/use-post-search.ts
import { computed, ref } from 'vue'
import { refDebounced } from '@vueuse/core'
import { usePosts } from '@/api/composables/posts'

/** The posts list filtered by a debounced search box, a page at a time. */
export function usePostSearch() {
  const search = ref('')
  const page = ref(1)
  const debouncedSearch = refDebounced(search, 300)

  // A getter, so the list refetches when the search or page changes
  const query = usePosts(() => ({ page: page.value, search: debouncedSearch.value }))

  const posts = computed(() => query.data.value?.posts ?? [])
  const total = computed(() => query.data.value?.total ?? 0)

  return { search, page, posts, total, isLoading: query.isLoading, errorMessage: query.errorMessage }
}
\`\`\`

- Take reactive inputs as \`MaybeRefOrGetter<T>\` and read them with \`toValue()\` inside a getter or \`computed\` — a plain value is read once and never updates
- Return refs and computeds (not \`.value\`s) so callers can destructure them and stay reactive
- Clean up what you start with \`onScopeDispose\` (listeners, timers, subscriptions)
- Keep it to one concern; compose small composables rather than growing one

### Common Patterns

**Debounced search input:**
\`\`\`vue
<script setup lang="ts">
import UInput from '@nuxt/ui/components/Input.vue'
import { usePostSearch } from '../composables/use-post-search'

const { search, posts } = usePostSearch()
</script>

<template>
  <UInput v-model="search" icon="i-lucide-search" placeholder="Search..." class="w-full" />
</template>
\`\`\`

**Open/close state:** a single \`const open = ref(false)\` bound with \`v-model:open\` on \`UModal\` is enough — no composable needed.
`
  },
}
