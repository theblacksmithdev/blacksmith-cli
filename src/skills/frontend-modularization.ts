import type { Skill, SkillContext } from './types.js'

export const frontendModularizationSkill: Skill = {
  id: 'frontend-modularization',
  name: 'Frontend Modularization',
  description: 'Component file structure, one-component-per-file rule, folder-based components, utility extraction, and barrel exports.',

  render(_ctx: SkillContext): string {
    return `## Frontend Modularization

> **RULE: One component per file. Extract non-component functions to utils. Promote complex components to folders with barrel exports.**

### One Component Per File

Every \`.tsx\` file exports exactly one React component. No sibling components, no inline helpers that render JSX.

\`\`\`tsx
// BAD — two components in one file
export function UserCard({ user }: Props) { ... }
export function UserCardSkeleton() { ... }

// GOOD — separate files
// user-card.tsx
export function UserCard({ user }: Props) { ... }

// user-card-skeleton.tsx
export function UserCardSkeleton() { ... }
\`\`\`

Small, tightly-coupled sub-components (e.g. a skeleton for a card) still get their own file — co-locate them in the same directory.

### Utility Functions Live in Utils

> **RULE: Reuse before writing. Before creating any helper function, search the codebase for an existing one. If a function can be used outside the file it lives in, it belongs in utils.**

Functions that are not components or hooks do not belong in component files. Extract them:

- **Page/feature-scoped utilities** → \`utils/\` folder next to the component
- **App-wide utilities** → \`src/shared/utils/\`

If the same logic exists in two places, extract it into a shared utility immediately — never duplicate.

\`\`\`tsx
// BAD — helper function sitting in the component file
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function PriceTag({ amount }: { amount: number }) {
  return <Text>{formatCurrency(amount)}</Text>
}

// GOOD — utility extracted
// utils/format.ts
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

// price-tag.tsx
import { formatCurrency } from '../utils/format'

export function PriceTag({ amount }: { amount: number }) {
  return <Text>{formatCurrency(amount)}</Text>
}
\`\`\`

**Exception:** Tiny, one-line helpers used only in that file (e.g. a local type guard) can stay inline. If it grows beyond a few lines or is used elsewhere, extract it.

### Simple Components — Single File

A component that is self-contained and has no children components stays as a single file:

\`\`\`
components/
├── user-avatar.tsx
├── status-badge.tsx
└── empty-state.tsx
\`\`\`

### Complex Components — Folder with Barrel Export

When a component grows to have its own child components or hooks, promote it to a folder:

\`\`\`
components/
└── data-table/
    ├── index.ts                    # Barrel — re-exports the main component
    ├── data-table.tsx              # Main component (the orchestrator)
    ├── components/
    │   ├── table-header.tsx        # Child component
    │   ├── table-row.tsx           # Child component
    │   ├── table-pagination.tsx    # Child component
    │   └── table-empty-state.tsx   # Child component
    ├── hooks/
    │   ├── use-table-sorting.ts    # Sorting logic
    │   └── use-table-filters.ts    # Filter logic
    └── utils/
        └── column-helpers.ts       # Non-component, non-hook helpers
\`\`\`

**\`index.ts\`** — barrel export for the main component:
\`\`\`ts
export { DataTable } from './data-table'
export type { DataTableProps } from './data-table'
\`\`\`

Consumers import from the folder, not the internal file:
\`\`\`tsx
// GOOD
import { DataTable } from '@/shared/components/data-table'

// BAD — reaching into internal structure
import { DataTable } from '@/shared/components/data-table/data-table'
\`\`\`

### When to Promote a File to a Folder

Promote a single-file component to a folder when any of these apply:

1. It has **child components** — sections of JSX that are large enough to extract
2. It has **custom hooks** — local logic that warrants its own file
3. It has **utility functions** — helpers that should live in \`utils/\`
4. It exceeds **~150 lines** — a sign it needs decomposition

### Folder Structure Rules

| What | Where |
|---|---|
| Child components only used by the parent | \`<component>/components/\` |
| UI logic hooks for the component | \`<component>/hooks/\` |
| Non-component, non-hook helpers | \`<component>/utils/\` |
| Main component | \`<component>/<component>.tsx\` |
| Public API | \`<component>/index.ts\` (barrel) |

### Barrel Export Rules

- The \`index.ts\` only re-exports the main component and its public types
- Child components in \`components/\` are private — they are **not** re-exported
- If a child component needs to be used elsewhere, move it up to the parent \`components/\` directory or to \`shared/components/\`

\`\`\`ts
// GOOD — index.ts re-exports only the public API
export { DataTable } from './data-table'
export type { DataTableProps, Column } from './data-table'

// BAD — leaking internal child components
export { DataTable } from './data-table'
export { TableHeader } from './components/table-header'
export { TableRow } from './components/table-row'
\`\`\`

### Where Components Live

| Scope | Location |
|---|---|
| Used across the entire app | \`src/shared/components/\` |
| Used only within a feature | \`src/features/<feature>/components/\` |
| Used only within a page | \`src/pages/<page>/components/\` |
| Used only within a parent component | \`<parent>/components/\` |

### Summary

1. **One component per file** — always
2. **Non-component functions go in \`utils/\`** — never loose functions in component files
3. **Reuse before writing** — search the codebase for existing utils before creating new ones; no duplicated logic
4. **Simple component = single file** — no folder overhead for leaf components
5. **Complex component = folder** with \`components/\`, \`hooks/\`, \`utils/\` subdirectories and an \`index.ts\` barrel
6. **Barrel exports are the public API** — consumers import from the folder, never reach into internals
7. **Scope determines location** — shared, feature, page, or parent component level
`
  },
}
