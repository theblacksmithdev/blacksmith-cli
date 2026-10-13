import type { Skill, SkillContext } from './types.js'

export const vueModularizationSkill: Skill = {
  id: 'frontend-modularization',
  name: 'Frontend Modularization',
  description: 'Single-file component structure, one-component-per-file rule, folder-based components, utility extraction, and barrel exports for the Vue frontend.',

  render(_ctx: SkillContext): string {
    return `## Frontend Modularization

> **RULE: One component per file. Extract non-component functions to utils. Promote complex components to folders with barrel exports.**

### One Component Per File

Every component is one single-file component (\`.vue\`), named in PascalCase after the component: \`PostCard.vue\` is \`<PostCard>\`. Everything that is not a component — composables, stores, utils, routes, schemas — is a kebab-case \`.ts\` file (\`use-posts-query.ts\`, \`auth-store.ts\`, \`routes.ts\`).

\`\`\`
// BAD — a second component hidden in a .ts file, or two components glued together
components/user-card.ts        // defineComponent({ ... }) x2

// GOOD — one SFC per component
components/UserCard.vue
components/UserCardSkeleton.vue
\`\`\`

Every SFC uses \`<script setup lang="ts">\` and the Composition API — never the Options API. Small, tightly-coupled sub-components (a skeleton for a card) still get their own file, co-located in the same directory.

### Explicit Imports

Nothing is registered globally. Import every component you use — your own and Nuxt UI's — at the top of \`<script setup>\`:

\`\`\`vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import UButton from '@nuxt/ui/components/Button.vue'
import UCard from '@nuxt/ui/components/Card.vue'
import { Path } from '@/router/paths'
import PageHeader from '@/shared/components/PageHeader.vue'
import PostCard from './components/PostCard.vue'
</script>
\`\`\`

Order the imports: packages (\`vue\`, \`vue-router\`, \`pinia\`, \`@tanstack/vue-query\`, \`zod\`), then Nuxt UI components, then \`@/\` imports, then relative ones. A component used without an import fails \`vue-tsc\` (\`checkUnknownComponents\` is on), so a missing import is a build error, not a blank spot on the page.

### Utility Functions Live in Utils

> **RULE: Reuse before writing. Before creating any helper function, search the codebase for an existing one. If a function can be used outside the file it lives in, it belongs in utils.**

Functions, mappings and formatters that are not components or composables do not belong in \`.vue\` files. Extract them:

- **Page/feature-scoped utilities** → \`utils/\` folder next to the component
- **App-wide utilities** → \`src/shared/utils/\`

Check what is already there first: \`api-error.ts\` (\`parseApiError\`, \`shouldRetryRequest\`), \`format-date.ts\` (\`formatDate\`, \`formatDateTime\`), \`form-errors.ts\` (\`toFormErrors\`), \`pagination.ts\` (\`PAGE_SIZE\`), \`status-icons.ts\`, \`color-mode.ts\`, \`api-url.ts\`, \`site-config.ts\`. For generic browser and reactivity helpers (debounce, storage, media queries), use VueUse (\`@vueuse/core\`) rather than writing your own.

If the same logic exists in two places, extract it into a shared utility immediately — never duplicate.

\`\`\`vue
<!-- BAD — helper function and lookup table sitting in the component -->
<script setup lang="ts">
const COLORS = { active: 'success', pending: 'warning' } as const

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}
</script>
\`\`\`

\`\`\`ts
// GOOD — utils/format.ts
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}
\`\`\`

\`\`\`vue
<!-- PriceTag.vue -->
<script setup lang="ts">
import { formatCurrency } from '../utils/format'

defineProps<{ amount: number }>()
</script>

<template>
  <span class="font-medium">{{ formatCurrency(amount) }}</span>
</template>
\`\`\`

**Exception:** a one-line handler used only by that component's template (\`function openEditor() { editing.value = true }\`) stays in \`<script setup>\`. If it grows beyond a few lines, is reused, or is a mapping or formatter, extract it.

### Simple Components — Single File

A component that is self-contained and has no child components stays as a single file:

\`\`\`
components/
├── UserAvatar.vue
├── StatusBadge.vue
└── EmptyState.vue
\`\`\`

### Complex Components — Folder with Barrel Export

When a component grows its own child components or composables, promote it to a folder:

\`\`\`
components/
└── data-table/
    ├── index.ts                    # Barrel — re-exports the main component
    ├── DataTable.vue               # Main component (the orchestrator)
    ├── types.ts                    # Public prop types (Column, Row)
    ├── components/
    │   ├── TableHeader.vue         # Child component
    │   ├── TableRow.vue            # Child component
    │   └── TableEmptyState.vue     # Child component
    ├── composables/
    │   ├── use-table-sorting.ts    # Sorting logic
    │   └── use-table-filters.ts    # Filter logic
    └── utils/
        └── column-helpers.ts       # Non-component, non-composable helpers
\`\`\`

**\`index.ts\`** — barrel export for the main component:
\`\`\`ts
export { default as DataTable } from './DataTable.vue'
export type { Column } from './types'
\`\`\`

Consumers import from the folder, not the internal file:
\`\`\`ts
// GOOD
import { DataTable } from '@/shared/components/data-table'

// BAD — reaching into internal structure
import DataTable from '@/shared/components/data-table/DataTable.vue'
\`\`\`

Prop types other files need go in the folder's \`types.ts\` — a \`.vue\` file exports its component, nothing else.

### When to Promote a File to a Folder

Promote a single-file component to a folder when any of these apply:

1. It has **child components** — sections of the template large enough to extract
2. It has **composables** — local logic that warrants its own file
3. It has **utility functions** — helpers that should live in \`utils/\`
4. It exceeds **~150 lines** — a sign it needs decomposition

### Folder Structure Rules

| What | Where |
|---|---|
| Child components only used by the parent | \`<component>/components/\` |
| UI logic composables for the component | \`<component>/composables/\` |
| Non-component, non-composable helpers | \`<component>/utils/\` |
| Shared prop types | \`<component>/types.ts\` |
| Main component | \`<component>/<Component>.vue\` |
| Public API | \`<component>/index.ts\` (barrel) |

### Barrel Export Rules

- The \`index.ts\` only re-exports the main component and its public types
- Child components in \`components/\` are private — they are **not** re-exported
- If a child component needs to be used elsewhere, move it up to the parent \`components/\` directory or to \`shared/components/\`

\`\`\`ts
// GOOD — index.ts re-exports only the public API
export { default as DataTable } from './DataTable.vue'
export type { Column } from './types'

// BAD — leaking internal child components
export { default as DataTable } from './DataTable.vue'
export { default as TableHeader } from './components/TableHeader.vue'
export { default as TableRow } from './components/TableRow.vue'
\`\`\`

### Where Code Lives

| Scope | Components | Composables |
|---|---|---|
| Used across the entire app | \`src/shared/components/\` | \`src/shared/composables/\` |
| API data for a resource | — | \`src/api/composables/<resource>/\` |
| Used only within a feature | \`src/features/<feature>/components/\` | \`src/features/<feature>/composables/\` |
| Used only within a page | \`src/pages/<page>/components/\` | \`src/pages/<page>/composables/\` |
| Used only within a parent component | \`<parent>/components/\` | \`<parent>/composables/\` |

Client state shared across the app (the signed-in user) lives in a Pinia store under \`features/<feature>/stores/\`, reached through a composable (\`useAuth()\`). Server data never goes in a store — it stays in TanStack Query.

Before writing a shared component, check \`src/shared/components/\`: \`PageHeader\`, \`StatusAlert\`, \`StatusPage\`, \`InfoCard\`, \`CommandSnippet\`, \`ListPagination\`, \`TextLink\`, \`BrandLogo\`, \`BrandMark\`, \`ColorModeButton\`, \`NotFoundPage\`.

### Summary

1. **One component per file** — always a PascalCase \`.vue\` with \`<script setup lang="ts">\`
2. **Import everything explicitly** — Nuxt UI components from \`@nuxt/ui/components/<Name>.vue\`, your own by path
3. **Non-component functions go in \`utils/\`** — never loose helpers, mappings or formatters in \`.vue\` files
4. **Reuse before writing** — search \`shared/\` and VueUse before creating anything new; no duplicated logic
5. **Simple component = single file** — no folder overhead for leaf components
6. **Complex component = folder** with \`components/\`, \`composables/\`, \`utils/\` subdirectories and an \`index.ts\` barrel
7. **Barrel exports are the public API** — consumers import from the folder, never reach into internals
8. **Scope determines location** — shared, feature, page, or parent component level
`
  },
}
