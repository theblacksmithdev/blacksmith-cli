import type { FrontendFramework } from '../utils/paths.js'
import type { SkillContext } from './types.js'
import { FRONTEND_TOOLCHAINS } from '../utils/frontend-toolchains.js'
import { REACT_PARADIGMS, VUE_PARADIGMS } from './frontend-paradigms.js'

/**
 * What the framework-neutral skills (core rules, overview, CLI, guidelines)
 * say about the frontend. One entry per framework, so a skill never re-derives
 * framework facts with its own conditionals.
 */
export interface FrontendProfile {
  framework: FrontendFramework
  name: string
  /** The UI kit the components come from. */
  uiKit: string
  /** The critical rules in CLAUDE.md that differ per framework, each starting with its heading. */
  rules: {
    ui: string
    pages: string
    logic: string
    paths: string
    api: string
    folders: string
  }
  /** The `frontend/` subtree of a fullstack project. */
  tree: string
  /** Where API data access lives, for the overview's workflow. */
  apiDir: string
  /** The unit logic is extracted into: hooks or composables. */
  logicUnits: string
  /** Frontend code style, for the AI guidelines. */
  codeStyle: string
  /** The UI and page bullets of the AI guidelines' frontend architecture. */
  architecture: string
  /** The UI, page and logic items of the AI guidelines' checklist (5–7). */
  checklist: string
  /** Test file names, for the checklist. */
  testFiles: string
  /** The components section of the clean-code skill. */
  componentRules: string
  /** One-line frontend paradigm, for the programming-paradigms summary. */
  paradigmSummary: string
  /** The frontend section of the programming-paradigms skill. */
  paradigms: string
  /** What `make:resource` generates on the frontend, as markdown bullets. */
  resourceSteps: string
}

export const FRONTEND_PROFILES: Record<FrontendFramework, FrontendProfile> = {
  react: {
    framework: 'react',
    name: FRONTEND_TOOLCHAINS.react.label,
    uiKit: 'Chakra UI',
    rules: {
      ui: `Use \`@chakra-ui/react\` v3 for ALL UI
- **Layout**: Use \`Stack\`, \`HStack\`, \`VStack\`, \`Flex\`, \`SimpleGrid\`, \`Box\`, \`Container\` with \`gap\` — NEVER styled \`<div>\`s. There is no Tailwind: never write utility \`className\`s
- **Typography**: Use \`Heading\` and \`Text\` — NEVER raw \`<h1>\`–\`<h6>\`, \`<p>\`, or \`<span>\` with text classes
- **Separators**: Use \`Separator\` — NEVER \`<hr>\`
- **Everything else**: \`Button\`, \`Card.Root\`, \`Badge\`, \`Field.Root\` + \`Input\`, \`Table.Root\`, \`Dialog.Root\`, \`Alert.Root\`, \`Skeleton\`, \`Stat.Root\`, etc. — v3 compound components, never v2 APIs (\`CardBody\`, \`FormControl\`, \`Modal\`, \`colorScheme\`, \`isLoading\`)
- **Colors**: Semantic tokens only (\`fg.muted\`, \`bg.subtle\`, \`border\`) — NEVER hex values or \`gray.500\`
- **Exceptions**: Semantic HTML landmarks (\`<main>\`, \`<section>\`, \`<nav>\`, \`<header>\`, \`<footer>\`, \`<article>\`, \`<aside>\`) are acceptable for page structure. \`<form>\` is acceptable with React Hook Form. \`<Link>\` from react-router-dom for navigation, wrapped via \`asChild\` (\`<Button asChild>\`) or the shared \`RouterLink\`
- See the \`chakra-ui-react\` skill for the full component list`,
      pages: `Pages Are Thin Orchestrators
- Pages import components, call hooks, and compose JSX — they should not contain business logic or large JSX blocks
- Break every page into child components in a \`components/\` folder. Aim for clarity, not a strict line count
- See the \`page-structure\` skill for the full pattern with examples`,
      logic: `Components Render, Hooks Think
- Extract ALL logic into hooks in a \`hooks/\` folder — API calls, mutations, form setup, filtering, pagination, debouncing, computed state
- Components should contain only JSX composition, prop passing, and simple event handler wiring
- The only \`useState\` acceptable inline in a component is a simple UI toggle (e.g. modal open/close)
- If a component has more than one \`useState\`, one \`useEffect\`, or any \`useApiQuery\`/\`useApiMutation\` — extract to a hook`,
      paths: `Use the \`Path\` Enum — Never Hardcode Paths
- All route paths are in \`src/router/paths.ts\` as a \`Path\` enum
- Use \`Path.Login\`, \`Path.Dashboard\`, etc. in \`navigate()\`, \`<Link to={}>\`, and route definitions
- When adding a new page, add its path to the enum before \`// blacksmith:path\`
- Use \`buildPath(Path.ResetPassword, { token })\` for dynamic segments`,
      api: `API Hooks vs UI Hooks — Two Different Places
- **API hooks** (data fetching) → \`src/api/hooks/<resource>/\` — queries, mutations, cache invalidation. Import as: \`import { usePosts } from '@/api/hooks/posts'\`
- **UI hooks** (page logic) → \`pages/<page>/hooks/\` or \`features/<feature>/hooks/\` — form state, pagination, filtering, debouncing
- Never put API data fetching in page-level hooks. Never put UI-only logic in \`src/api/hooks/\`
- See the \`react-query\` skill for API hook conventions`,
      folders: `Follow the Page/Feature Folder Structure
\`\`\`
pages/<page>/
├── <page>.tsx         # Thin orchestrator (default export)
├── routes.tsx         # RouteObject[] using Path enum
├── index.ts           # Re-exports public API
├── components/        # Child components
└── hooks/             # Page-local hooks (UI logic only, not API hooks)
\`\`\`
- See the \`page-structure\` skill for full conventions`,
    },
    tree: `├── frontend/             # React + Vite project
│   ├── src/
│   │   ├── api/          # API client and hooks
│   │   ├── features/     # Feature modules (auth, etc.)
│   │   ├── pages/        # Top-level pages
│   │   ├── router/       # React Router setup and layouts
│   │   ├── shared/       # Shared components (ui/ = Chakra glue), hooks, utils
│   │   └── theme/        # Chakra UI v3 design system (tokens, recipes, presets)
│   └── package.json`,
    apiDir: 'src/api/hooks/',
    logicUnits: 'hooks',
    codeStyle: `TypeScript strict mode. Functional components. Named exports (not default, except for page components used in routes). Descriptive variable names`,
    architecture: `- **Use \`@chakra-ui/react\` for ALL UI** — \`Stack\`, \`HStack\`, \`Flex\`, \`SimpleGrid\` for layout; \`Heading\`, \`Text\` for text; \`Card.Root\`, \`Button\`, \`Badge\`, etc. for all elements (Chakra v3 APIs, semantic color tokens, no Tailwind). Never use raw HTML (\`<div>\`, \`<h1>\`, \`<p>\`, \`<button>\`) when a Chakra UI component exists. Semantic landmarks (\`<main>\`, \`<section>\`, \`<nav>\`, etc.) are the only exception
- **Pages are thin orchestrators** — compose child components from \`components/\`, extract logic into \`hooks/\`. Aim for clarity over strict line counts`,
    checklist: `5. All UI uses \`@chakra-ui/react\` v3 components — no raw \`<div>\` for layout, no raw \`<h1>\`-\`<h6>\` for text, no hardcoded colors
6. Pages are modular — page file is a thin orchestrator, sections are in \`components/\`, logic in \`hooks/\`
7. Logic is in hooks — no \`useApiQuery\`, \`useApiMutation\`, \`useEffect\`, or multi-\`useState\` in component bodies`,
    testFiles: `\`.spec.tsx\` / \`.spec.ts\``,
    componentRules: `### Components (React-specific)
- One component per file. The file name should match the component name
- Keep components under 100 lines of JSX. Extract sub-components when they grow beyond this
- Separate data logic (hooks) from presentation (components). A component should mostly be JSX, not logic
- **Page components are orchestrators** — they should be ~20-30 lines, composing child components from \`components/\` and calling hooks from \`hooks/\`. Never build a 200-line page monolith
- Props interfaces should be explicit and narrow — accept only what the component needs, not entire objects
- Avoid prop drilling beyond 2 levels — use context or restructure the component tree
- Destructure props in the function signature for clarity
- Use \`@chakra-ui/react\` layout components (\`Stack\`, \`HStack\`, \`Flex\`, \`SimpleGrid\`) with \`gap\` — never styled \`<div>\`s or utility classes`,
    paradigmSummary: '**Frontend (React/TypeScript): Functional programming.** Pure functions, immutability, composition, declarative UI.',
    paradigms: REACT_PARADIGMS,
    resourceSteps: `- \`src/api/hooks/blog-posts/\` — query and mutation hooks
- \`src/pages/blog-posts/\` — list and detail pages
- Registers route path in \`src/router/paths.ts\` and routes in \`src/router/routes.tsx\``,
  },
  vue: {
    framework: 'vue',
    name: FRONTEND_TOOLCHAINS.vue.label,
    uiKit: 'Nuxt UI',
    rules: {
      ui: `Use Nuxt UI v4 for ALL Interactive UI
- **Components**: \`UButton\`, \`UCard\`, \`UBadge\`, \`UAlert\`, \`UForm\` + \`UFormField\` + \`UInput\`, \`UModal\`, \`UDropdownMenu\`, \`UTable\`, \`USkeleton\`, \`UPagination\`, \`UAccordion\` — never hand-built buttons, inputs, dialogs or menus
- **Import every component you use**: \`import UButton from '@nuxt/ui/components/Button.vue'\`. Nothing is registered globally, and \`vue-tsc\` fails on a component that is used but not imported
- **Layout and text**: semantic HTML (\`<div>\`, \`<section>\`, \`<h1>\`, \`<p>\`) styled with Tailwind utility classes (\`flex\`, \`grid\`, \`gap-4\`, \`text-sm\`)
- **Colors**: Nuxt UI's semantic classes only (\`text-highlighted\`, \`text-muted\`, \`bg-default\`, \`bg-elevated\`, \`border-default\`, \`text-primary\`) — NEVER hex values or raw palette classes like \`text-gray-500\`
- **Icons**: Iconify names on the components' \`icon\` props or \`UIcon\` — \`i-lucide-plus\`
- **Links**: \`UButton :to\` for button-styled links, the shared \`TextLink\` for text links, \`RouterLink\` for anything else
- See the \`nuxt-ui\` skill for the full component list`,
      pages: `Pages Are Thin Orchestrators
- Pages import components, call composables, and compose the template — they should not contain business logic or large template blocks
- Break every page into child components in a \`components/\` folder. Aim for clarity, not a strict line count
- See the \`page-structure\` skill for the full pattern with examples`,
      logic: `Components Render, Composables Think
- Extract ALL logic into composables in a \`composables/\` folder — API calls, mutations, form setup, filtering, pagination, debouncing, derived state
- Components should contain only template composition, prop passing, and simple event handler wiring
- The only \`ref\` acceptable inline in a component is a simple UI toggle (e.g. modal open/close)
- If a component has more than one \`ref\`, a \`watch\`, or any \`useApiQuery\`/\`useApiMutation\` — extract to a composable`,
      paths: `Use the \`Path\` Enum — Never Hardcode Paths
- All route paths are in \`src/router/paths.ts\` as a \`Path\` enum
- Use \`Path.Login\`, \`Path.Dashboard\`, etc. in \`router.push()\`, \`:to\`, and route definitions
- When adding a new page, add its path to the enum before \`// blacksmith:path\`
- Use \`buildPath(Path.ResetPassword, { token })\` for dynamic segments`,
      api: `API Composables vs UI Composables — Two Different Places
- **API composables** (data fetching) → \`src/api/composables/<resource>/\` — queries, mutations, cache invalidation. Import as: \`import { usePosts } from '@/api/composables/posts'\`
- **UI composables** (page logic) → \`pages/<page>/composables/\` or \`features/<feature>/composables/\` — form state, pagination, filtering, debouncing
- Never put API data fetching in page-level composables. Never put UI-only logic in \`src/api/composables/\`
- See the \`vue-query\` skill for API composable conventions`,
      folders: `Follow the Page/Feature Folder Structure
\`\`\`
pages/<page>/
├── <Page>Page.vue     # Thin orchestrator
├── routes.ts          # RouteRecordRaw[] using the Path enum, lazy-loaded pages
├── index.ts           # Re-exports public API
├── components/        # Child components, one PascalCase .vue file each
└── composables/       # Page-local composables (UI logic only, not API composables)
\`\`\`
- See the \`page-structure\` skill for full conventions`,
    },
    tree: `├── frontend/             # Vue + Vite project
│   ├── src/
│   │   ├── api/          # API client and composables
│   │   ├── features/     # Feature modules (auth, etc.)
│   │   ├── pages/        # Top-level pages
│   │   ├── router/       # Vue Router setup, guards and layouts
│   │   ├── shared/       # Shared components, composables, utils
│   │   └── theme/        # Nuxt UI + Tailwind design system (main.css, presets)
│   └── package.json`,
    apiDir: 'src/api/composables/',
    logicUnits: 'composables',
    codeStyle: 'TypeScript strict mode. \`<script setup lang="ts">\` single-file components, Composition API only. PascalCase \`.vue\` files, kebab-case \`.ts\` files. Explicit imports for every component and composable. Descriptive variable names',
    architecture: `- **Use Nuxt UI for ALL interactive UI** — \`UButton\`, \`UCard\`, \`UForm\`, \`UModal\`, \`UDropdownMenu\`, etc., each imported from \`@nuxt/ui/components/\`; Tailwind utility classes for layout and spacing; Nuxt UI's semantic color classes (\`text-muted\`, \`bg-elevated\`, \`border-default\`), never hex values. Never hand-build a button, input, dialog or menu
- **Pages are thin orchestrators** — compose child components from \`components/\`, extract logic into \`composables/\`. Aim for clarity over strict line counts`,
    checklist: `5. All interactive UI uses Nuxt UI components, each imported explicitly — no hand-built controls, no hardcoded colors
6. Pages are modular — page file is a thin orchestrator, sections are in \`components/\`, logic in \`composables/\`
7. Logic is in composables — no \`useApiQuery\`, \`useApiMutation\`, \`watch\`, or several \`ref\`s in component scripts`,
    testFiles: '\`.spec.ts\`',
    componentRules: `### Components (Vue-specific)
- One component per file. The PascalCase file name is the component name (\`PostCard.vue\`)
- Keep templates under 100 lines. Extract child components when they grow beyond this
- Separate logic (composables) from presentation (components). A component's script should mostly declare props, emits and the composables it calls
- **Page components are orchestrators** — they should be ~20-30 lines of script, composing child components from \`components/\` and calling composables from \`composables/\`. Never build a 200-line page monolith
- Type props and emits with \`defineProps<...>()\` and \`defineEmits<...>()\`; use \`defineModel\` for two-way bindings
- Props should be explicit and narrow — accept only what the component needs, not entire objects
- Never mutate a prop. Emit an event or use \`defineModel\`
- Avoid prop drilling beyond 2 levels — use a composable or \`provide\`/\`inject\`
- Use Tailwind utility classes on semantic HTML for layout (\`flex\`, \`grid\`, \`gap-4\`) and Nuxt UI components for every interactive element`,
    paradigmSummary: '**Frontend (Vue/TypeScript): Functional programming.** Composition API, composables, derived state, declarative templates.',
    paradigms: VUE_PARADIGMS,
    resourceSteps: `- \`src/api/composables/blog-posts/\` — query and mutation composables
- \`src/pages/blog-posts/\` — list and detail pages, the form, and a create/edit dialog
- Registers route path in \`src/router/paths.ts\` and routes in \`src/router/routes.ts\``,
  },
}

export function frontendProfile(ctx: SkillContext): FrontendProfile {
  return FRONTEND_PROFILES[ctx.frontendFramework ?? 'react']
}
