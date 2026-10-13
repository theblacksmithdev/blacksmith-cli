import type { Skill, SkillContext } from './types.js'
import { backendProfile } from './backend-profiles.js'

export const vueSkill: Skill = {
  id: 'vue',
  name: 'Vue Frontend Conventions',
  description: 'Tech stack, single-file component conventions, reactivity rules, state management, styling, and testing for the Vue frontend.',

  render(ctx: SkillContext): string {
    const backend = backendProfile(ctx)

    return `## Vue Frontend Conventions

### Tech Stack
- Vue 3.5 + TypeScript (strict mode), Composition API with \`<script setup lang="ts">\` only
- Vite for bundling and the dev server; \`vue-tsc\` type-checks \`.vue\` files in \`npm run build\`
- TanStack Vue Query for server state
- Vue Router 4 for client-side routing
- Pinia for client state (the signed-in session)
- Nuxt UI v4 on Tailwind CSS v4 for components, theming and styling
- Zod for form validation, through Nuxt UI's \`UForm\`
- VueUse (\`@vueuse/core\`) for generic composables — check it before writing one
- \`@fontsource-variable/inter\` for typography, Iconify Lucide icons (\`i-lucide-*\`)
- \`@hey-api/openapi-ts\` for auto-generating the API client from ${backend.name}'s OpenAPI schema
- ESLint with \`eslint-plugin-vue\` (\`npm run lint\`)

### API Layer
- Auto-generated client in \`frontend/src/api/generated/\` — **never edit these files manually**
- Custom API configuration (base URL, interceptors, auth headers) in \`frontend/src/api/client.ts\`
- Query client defaults in \`frontend/src/api/query-client.ts\`; every app plugin is installed in \`frontend/src/plugins.ts\`
- After any backend API change, run \`blacksmith sync\` to regenerate the client

### Project Structure
- See the \`page-structure\` skill for page folders, feature modules, routing, and route composition conventions
- Shared, cross-feature code lives in \`frontend/src/shared/\` (\`components/\`, \`composables/\`, \`utils/\`)

### Single-File Components
- One component per \`.vue\` file, named in PascalCase after the component: \`PostCard.vue\`, \`PostsPage.vue\`. Every other file is kebab-case: \`use-posts-query.ts\`, \`auth-store.ts\`
- Order inside a file: \`<script setup lang="ts">\`, then \`<template>\`. No \`<style>\` blocks — style with Tailwind classes
- Type everything at the declaration:
\`\`\`vue
<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue'
import type { Post } from '@/api/generated'

const props = withDefaults(defineProps<{
  post: Post
  compact?: boolean
}>(), {
  compact: false,
})

const emit = defineEmits<{
  select: [id: number]
}>()

/** Two-way binding: \`<PostPicker v-model:open="isOpen" />\` */
const open = defineModel<boolean>('open', { required: true })
</script>
\`\`\`
- Use \`defineSlots\` to type named slots, and document each prop and slot with a short comment when its purpose is not obvious from the name
- **Import every component and composable you use**, Nuxt UI's included (\`import UCard from '@nuxt/ui/components/Card.vue'\`). Nothing is auto-imported, and \`vue-tsc\` fails on a component used but not imported
- Import order: Vue and other packages, then \`@nuxt/ui/components/*\`, then \`@/\` aliases, then relative imports

### Reactivity Rules
- \`ref\` for state, \`computed\` for anything derived from it — never copy derived data into another \`ref\` and sync it with \`watch\`
- Never mutate a prop. Emit an event or use \`defineModel\`
- Destructuring a \`reactive()\` object or a Pinia store loses reactivity: use \`storeToRefs(store)\`, or keep the object. Composables return refs and functions, so their results can be destructured
- In the template, refs returned at the top of \`<script setup>\` unwrap automatically; refs nested inside an object do not. Destructure what the template needs:
\`\`\`ts
// The template reads isCreating and createError directly
const { mutate: createPost, isPending: isCreating, errorMessage: createError } = useCreatePost()
\`\`\`
- Pass query parameters as a getter so the query follows them: \`usePosts(() => ({ page: page.value }))\`. A plain object is read once
- \`watch\` is for side effects only (syncing with something outside Vue). Prefer \`computed\`

### State Management
- **Server state**: TanStack Vue Query — see the \`vue-query\` skill for \`useApiQuery\` and \`useApiMutation\`
- **Client state**: Pinia setup stores in \`features/<feature>/stores/\`. The only one generated is the auth store; components reach it through \`useAuth()\`
- **Form state**: a \`reactive\` object passed to \`UForm\`'s \`:state\` — see the \`nuxt-ui-forms\` skill
- **Local UI state**: a \`ref\` in the component for a simple toggle; anything more goes in a composable

### Component Patterns
- Components render; composables think; pages compose. Extract logic into a \`composables/\` folder next to the page or feature
- Keep components focused — extract child components when a template grows beyond ~100 lines
- Prefer slots and props over \`provide\`/\`inject\`; use \`provide\`/\`inject\` only for genuinely tree-wide context
- **Pages must be thin orchestrators** — break into child components in \`components/\`, extract logic into \`composables/\`. See the \`page-structure\` skill for the full pattern

### UI Components
- **All interactive UI uses Nuxt UI** — see the \`nuxt-ui\` skill for the components and theming
- Reuse the shared components in \`src/shared/components/\` before writing new ones: \`PageHeader\`, \`StatusAlert\`, \`StatusPage\`, \`InfoCard\`, \`CommandSnippet\`, \`TextLink\`, \`ListPagination\`, \`BrandLogo\`, \`BrandMark\`, \`ColorModeButton\`, \`NotFoundPage\`
- Shared helpers live in \`src/shared/utils/\`: \`api-error\` (\`parseApiError\`, \`shouldRetryRequest\`), \`format-date\`, \`form-errors\` (\`toFormErrors\`), \`pagination\` (\`PAGE_SIZE\`), \`status-icons\`, \`color-mode\`, \`api-url\`, \`site-config\`

### Route Paths
- All route paths live in the \`Path\` enum at \`src/router/paths.ts\` — **never hardcode path strings**
- Use \`Path\` in route records, \`router.push()\` and \`:to\`
- Use \`buildPath()\` for dynamic segments — see the \`page-structure\` skill for details

### Styling
- Tailwind CSS v4 utility classes on semantic HTML for layout and spacing; Nuxt UI components for everything interactive
- The design system lives in \`src/theme/\`: \`main.css\` (Tailwind and Nuxt UI imports, the \`--ui-*\` color, radius and font variables, the \`interactive-card\` utility), \`presets.ts\` (the theme preset), \`ui-config.ts\` (Nuxt UI color aliases and component overrides, read by \`vite.config.ts\`), \`apply-preset.ts\`
- The default look is OpenAI-inspired: monochrome surfaces, hairline borders, pill-shaped controls, tight Inter type
- Use Nuxt UI's semantic classes only — \`text-default\`, \`text-highlighted\`, \`text-muted\`, \`text-dimmed\`, \`bg-default\`, \`bg-muted\`, \`bg-elevated\`, \`border-default\`, \`border-muted\`, \`border-accented\`, \`text-primary\`. Never hex values or raw palette classes such as \`text-gray-500\`
- Change a component's look for the whole app in \`src/theme/ui-config.ts\`, or one instance through its \`:ui\` prop
- Color mode: \`useColorMode()\` from \`@/shared/composables/use-color-mode\`; dark styles come from the \`dark:\` variant or the semantic classes
- Responsive layouts use Tailwind breakpoints (\`grid-cols-1 md:grid-cols-3\`)
- No inline \`style\` attributes and no \`<style>\` blocks

### Path Aliases
- \`@/\` maps to \`frontend/src/\`
- Always use the alias for imports: \`import { useAuth } from '@/features/auth'\`
- Never use relative paths that go up more than one level (\`../../\`)

### Error Handling
- \`RouteErrorBoundary\` (\`src/router/RouteErrorBoundary.vue\`) catches errors thrown while rendering a page and offers a reload
- API errors are handled by \`useApiQuery\` / \`useApiMutation\` — see the \`vue-query\` skill for display patterns
- Show user-facing errors with \`StatusAlert\`, or a toast from Nuxt UI's \`useToast\`

### Testing
- See the \`frontend-testing\` skill for test placement, utilities, mocking, and what to test
- **Every code change must include corresponding tests**
- Tests are \`.spec.ts\` files in \`__tests__/\` folders next to the code they test
- Always mount with \`renderWithProviders\` from \`@/__tests__/test-utils\` — never \`render\` from \`@testing-library/vue\` directly
`
  },
}
