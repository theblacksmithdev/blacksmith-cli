import type { Skill, SkillContext } from './types.js'

export const nuxtUiSkill: Skill = {
  id: 'nuxt-ui',
  name: 'Nuxt UI',
  description: 'Core UI component library — Nuxt UI v4 components on Tailwind CSS v4 for layout, typography, inputs, data display, overlays, feedback, and navigation.',

  render(_ctx: SkillContext): string {
    return `## Nuxt UI — Core UI Components (v4, plain Vue)

> **CRITICAL RULE: Every interactive or styled element MUST be a Nuxt UI component when one exists.**
> Buttons, inputs, cards, alerts, badges, menus, dialogs, tables and tabs come from Nuxt UI — never hand-built from \`<button>\`, \`<input>\` or styled \`<div>\`s.
> Layout and text use plain elements (\`<div>\`, \`<section>\`, \`<h1>\`, \`<p>\`) with **Tailwind CSS v4** classes and Nuxt UI's **semantic** color classes.

Nuxt UI runs here **without Nuxt**: the \`@nuxt/ui/vite\` plugin in \`vite.config.ts\` and the \`@nuxt/ui/vue-plugin\` installed in \`src/plugins.ts\`. The whole app renders inside \`<UApp>\` (\`src/App.vue\`), which provides toasts, tooltips and overlays.

### Imports — Explicit, Always

Global registration is **off** (\`components: false\`, \`autoImport: false\` in \`vite.config.ts\`). Import every Nuxt UI component you use, from its own file:

\`\`\`vue
<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue'
import UCard from '@nuxt/ui/components/Card.vue'
import type { DropdownMenuItem } from '@nuxt/ui'
import { useToast } from '@nuxt/ui/composables'
</script>
\`\`\`

- The local name is always \`U\` + the file name: \`UButton\`, \`UFormField\`, \`UDropdownMenu\`
- A forgotten import fails \`vue-tsc\` (\`checkUnknownComponents\` in \`tsconfig.app.json\`) — \`npm run build\` catches it
- Types (\`DropdownMenuItem\`, \`FormSubmitEvent\`, \`FormError\`, \`TableColumn\`) come from \`'@nuxt/ui'\`; composables (\`useToast\`, \`useOverlay\`) from \`'@nuxt/ui/composables'\`
- Imports are grouped: \`vue\` / \`vue-router\` / packages, then \`@nuxt/ui/components/*\`, then \`@/...\`, then relative

### Layout & Typography

There are no layout components — use elements with Tailwind classes:

| Need | Write |
|------|-------|
| Vertical stack | \`<div class="flex flex-col gap-6">\` |
| Row | \`<div class="flex items-center gap-2">\` |
| Responsive grid | \`<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">\` |
| Page width | \`<UContainer class="max-w-6xl">\` (the layouts already add it) |
| Separator | \`<USeparator />\` — never \`<hr>\` |
| Page title | \`<PageHeader title="..." />\` (\`@/shared/components/PageHeader.vue\`) |
| Heading | \`<h2 class="text-2xl font-semibold tracking-tight text-highlighted">\` |
| Body text | \`<p class="text-default">\` |
| Secondary text | \`<p class="text-sm text-muted">\` |
| Caption | \`<p class="text-xs text-dimmed">\` |
| Code | \`<code class="font-mono text-xs">\` or \`<CommandSnippet command="..." />\` |

### Actions

- \`UButton\` — every button and button-styled link
  - \`color\`: \`primary\` (default, follows the theme preset) | \`neutral\` | \`error\` | \`success\` | \`warning\` | \`info\`
  - \`variant\`: \`solid\` | \`outline\` | \`soft\` | \`subtle\` | \`ghost\` | \`link\`
  - \`size\`: \`xs\` … \`xl\`; \`block\` for full width; \`:loading="isPending"\` while a request runs
  - Icons: \`icon="i-lucide-plus"\` (leading), \`trailing-icon="i-lucide-arrow-right"\`
  - As a link: \`<UButton :to="Path.Dashboard">\` (router link) or \`:to="url" target="_blank"\` (external)
  - Icon-only buttons need \`aria-label\`
- \`ULink\` — a plain router-aware link; for text links in prose prefer the shared \`TextLink\` (\`@/shared/components/TextLink.vue\`, \`muted\` prop for quiet links)
- \`UDropdownMenu\` — \`:items="DropdownMenuItem[][]"\` (groups), \`onSelect\` per item, a custom row with \`slot: 'name'\` + \`<template #name>\`

### Data Entry

Every field sits in \`UForm\` + \`UFormField\` — see the \`nuxt-ui-forms\` skill.

- \`UInput\` (\`type\`, \`placeholder\`, \`icon\`, \`autocomplete\`), \`UTextarea\` (\`:rows\`, \`autoresize\`)
- \`USelect\` (\`:items\`), \`USelectMenu\` (searchable), \`UInputMenu\` (autocomplete)
- \`UCheckbox\`, \`UCheckboxGroup\`, \`URadioGroup\`, \`USwitch\`
- \`UInputNumber\`, \`USlider\`, \`UPinInput\`, \`UInputDate\`, \`UInputTags\`, \`UFileUpload\`
- Bind with \`v-model\` to the form's \`reactive\` state

### Data Display

- \`UCard\` — surfaces; \`variant="outline"\`; \`#header\` / default / \`#footer\` slots; adjust padding with \`:ui="{ body: '...' }"\`
- \`UTable\` — \`:data\` + \`:columns\` (\`TableColumn<T>[]\` from \`'@nuxt/ui'\`) — never a raw \`<table>\`
- \`UBadge\` — status and tags (\`color\`, \`variant="outline" | "soft" | "subtle"\`)
- \`UAvatar\` — \`:src\` or \`:alt\` (initials)
- \`USkeleton\` — loading placeholders (\`class="h-32 rounded-2xl"\`); \`UProgress\` for progress
- \`UIcon name="i-lucide-inbox"\` — every icon is an Iconify name from the bundled Lucide set (\`i-lucide-*\`); no icon components
- \`UEmpty\` or the dashed-border empty state the resource lists use
- \`UTooltip\`, \`UKbd\`, \`UUser\`, \`UTimeline\`

### Tabs, Accordion & Navigation

- \`UTabs\` — \`:items\` with \`label\`, \`slot\`, \`content\`
- \`UAccordion\` — \`:items\`; existing arrays can be passed as-is with \`label-key\` / \`value-key\` and a \`#body="{ item }"\` slot (see \`FaqList.vue\`)
- \`UBreadcrumb\` — \`:items\` with \`label\` and \`to\`
- \`ListPagination\` (\`@/shared/components/ListPagination.vue\`) — \`v-model:page\` + \`:total\`, hides itself when one page fits; wraps \`UPagination\` with the backend's \`PAGE_SIZE\`

### Overlays

- \`UModal\` — \`v-model:open\`, \`title\`, \`description\`, content in \`<template #body>\` (and \`#footer\`)
- \`USlideover\` — side panel, same API as \`UModal\`; \`UDrawer\` for bottom sheets
- \`UPopover\` — floating panels
- Programmatic overlays: \`useOverlay()\` from \`'@nuxt/ui/composables'\`
- Overlays teleport into \`<UApp>\` — tests render inside it through \`renderWithProviders\`

### Feedback

- \`StatusAlert\` (\`@/shared/components/StatusAlert.vue\`) — inline messages: \`message\`, optional \`title\`, \`status\` (\`error\` | \`success\` | \`info\` | \`warning\` | \`neutral\`). Wraps \`UAlert\`; use it instead of \`UAlert\` directly
- Toasts: \`const toast = useToast()\` then \`toast.add({ title: 'Saved', color: 'success' })\` — \`<UApp>\` already renders the toaster
- \`StatusPage\` — full-page 404 / crash / access-denied messages with an \`#actions\` slot

### Shared Components — Reuse Before Writing

In \`src/shared/components/\`, one component per file:

| Component | Use |
|-----------|-----|
| \`PageHeader\` | Page \`<h1>\` + description + \`#actions\` slot (\`align="center"\` for auth/marketing) |
| \`StatusAlert\` | Inline error / success / info message |
| \`StatusPage\` | Centered full-bleed message (\`code\`, \`title\`, \`description\`, \`#actions\`) |
| \`InfoCard\` | Icon tile + title + description + optional \`badge\` and default slot |
| \`CommandSnippet\` | A terminal command as a monospace pill |
| \`TextLink\` | Router text link (\`muted\` for quiet links) |
| \`ListPagination\` | Page links under a paginated list |
| \`BrandLogo\` / \`BrandMark\` | App mark + name linking home / the bare mark |
| \`ColorModeButton\` | Light/dark toggle |
| \`NotFoundPage\` | The 404 route |

### Design Tokens & Theming

- The design system is \`src/theme/main.css\`: \`@import "tailwindcss"\`, \`@import "@nuxt/ui"\`, then the \`--ui-*\` variables (neutral scale, surfaces, text, borders, \`--ui-radius\`) for light and \`.dark\`
- Use **semantic classes**: \`bg-default\`, \`bg-muted\`, \`bg-elevated\`, \`bg-accented\`; \`text-default\`, \`text-highlighted\`, \`text-toned\`, \`text-muted\`, \`text-dimmed\`; \`border-default\`, \`border-muted\`, \`border-accented\`; \`text-primary\` / \`bg-primary\` for the accent
- Never raw palette classes (\`text-gray-500\`, \`bg-zinc-900\`) or hex values in templates; \`bg-ink\` / \`text-ink\` (\`--color-ink\`) is the one brand colour token
- \`interactive-card\` (a Tailwind \`@utility\` in \`main.css\`) — hover border + panel shadow for clickable cards
- \`tracking-display\` — the tight letter-spacing of hero and status headings
- Colour aliases and component overrides (pill buttons, inputs, badges) live in \`src/theme/ui-config.ts\`, built from \`activePreset\` in \`src/theme/presets.ts\`; \`vite.config.ts\` reads them **at startup**, so restart \`blacksmith dev\` after editing
- \`src/theme/apply-preset.ts\` writes \`data-accent\` / \`data-corners\` on \`<html>\`; \`main.css\` draws the \`mono\` accent and square corners from them
- Change a component's look once, in \`ui-config.ts\` — not by repeating \`class\`/\`:ui\` overrides on every use

### Component-First Rules

1. **Controls**: NEVER \`<button>\`, \`<input>\`, \`<select>\`, \`<textarea>\`. Use \`UButton\`, \`UInput\`, \`USelect\`, \`UTextarea\` inside \`UFormField\`.
2. **Surfaces**: \`UCard\` — never a bordered \`<div>\` built by hand.
3. **Tables**: \`UTable\` — never raw \`<table>\`.
4. **Loading**: \`USkeleton\` for content, \`:loading\` on buttons — never hand-rolled pulse divs.
5. **Overlays**: \`UModal\`, \`USlideover\`, \`UPopover\` — never custom positioned \`<div>\`s.
6. **Feedback**: \`StatusAlert\` or toasts — never plain red text.
7. **Icons**: \`UIcon\` / the \`icon\` props with \`i-lucide-*\` names.
8. **Colors**: semantic classes only. No hex, no \`gray-*\`.
9. **Separators**: \`USeparator\`.
10. **Imports**: every \`U*\` component imported explicitly.

### Example: Resource Card (Correct Way)

\`\`\`vue
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Post } from '@/api/generated'
import UCard from '@nuxt/ui/components/Card.vue'
import { Path } from '@/router/paths'
import { formatDate } from '@/shared/utils/format-date'

defineProps<{
  post: Post
}>()
</script>

<template>
  <UCard variant="outline" class="interactive-card relative h-full" :ui="{ body: 'flex h-full flex-col gap-2' }">
    <h3 class="font-semibold tracking-tight text-highlighted">
      <!-- The link covers the whole card -->
      <RouterLink :to="\`\${Path.Posts}/\${post.id}\`" class="after:absolute after:inset-0">
        {{ post.title }}
      </RouterLink>
    </h3>
    <p v-if="post.description" class="line-clamp-2 text-sm text-muted">
      {{ post.description }}
    </p>
    <p class="mt-auto pt-2 text-xs text-dimmed">
      {{ formatDate(post.created_at) }}
    </p>
  </UCard>
</template>
\`\`\`

### Example: Row Actions With a Confirmed Delete

\`\`\`vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DropdownMenuItem } from '@nuxt/ui'
import UButton from '@nuxt/ui/components/Button.vue'
import UDropdownMenu from '@nuxt/ui/components/DropdownMenu.vue'
import UModal from '@nuxt/ui/components/Modal.vue'

const emit = defineEmits<{ edit: []; delete: [] }>()

const confirming = ref(false)

const items = computed<DropdownMenuItem[][]>(() => [
  [{ label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => emit('edit') }],
  [{ label: 'Delete', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => (confirming.value = true) }],
])

function confirmDelete() {
  confirming.value = false
  emit('delete')
}
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'end' }">
    <UButton icon="i-lucide-ellipsis" variant="ghost" color="neutral" aria-label="Actions" />
  </UDropdownMenu>

  <UModal v-model:open="confirming" title="Delete post" description="This cannot be undone.">
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton variant="outline" color="neutral" @click="confirming = false">
          Cancel
        </UButton>
        <UButton color="error" @click="confirmDelete">
          Delete
        </UButton>
      </div>
    </template>
  </UModal>
</template>
\`\`\`
`
  },
}
