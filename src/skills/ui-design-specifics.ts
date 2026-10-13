import type { FrontendFramework } from '../utils/paths.js'

/**
 * The parts of the ui-design skill that name a UI kit's components, classes
 * or tokens. The design principles around them are shared, in ui-design.ts.
 */
export interface UiDesignSpecifics {
  brand: string
  hairlines: string
  spacing: string
  spacingRules: string
  typography: string
  typographyRows: string
  typographyRules: string
  color: string
  colorRules: string
  dark: string
  interactions: string
  responsive: string
  componentSkill: string
}

export const UI_DESIGN_SPECIFICS: Record<FrontendFramework, UiDesignSpecifics> = {
  react: {
    brand: `(the \`brand\` palette)`,
    hairlines: `Separate surfaces with \`border\` / \`border.muted\`; reserve the \`panel\` shadow for floating layers`,
    spacing: `Use Chakra UI's numeric spacing scale consistently (1 = 4px):`,
    spacingRules: `- Use \`Stack gap="..."\` / \`HStack gap="..."\` for sibling spacing — not margin on individual items (\`spacing\` is v2 and does not exist)
- Page content: the main layout already wraps pages in \`Container maxW="6xl"\`
- Cards: the card recipe sets padding via \`size\` (\`sm\` | \`md\` | \`lg\`) — don't override with \`p\``,
    typography: `Inter Variable is the body and heading font; headings use tight letter-spacing from the heading recipe.`,
    typographyRows: `| Hero | \`<Heading as="h1" fontSize={{ base: '5xl', md: '7xl' }} letterSpacing="display">\` | Landing pages only |
| Page title | \`<PageHeader title="..." />\` (renders \`Heading as="h1" size="2xl"\`) | One per page |
| Section title | \`<Heading as="h2" size="xl">\` | Major sections |
| Sub-section | \`<Heading as="h3" size="lg">\` | Groups within a section |
| Card title | \`<Card.Title>\` | Card headings |
| Body | \`<Text>\` | Paragraphs, descriptions |
| Secondary | \`<Text color="fg.muted">\` | Descriptions, helper copy |
| Caption | \`<Text textStyle="xs" color="fg.subtle">\` | Metadata, timestamps |`,
    typographyRules: `- Max reading width: \`maxW="prose"\` for long-form text
- Code and commands: \`Code\` or the shared \`CommandSnippet\``,
    color: `Use semantic tokens — never hex/rgb values or raw palette steps like \`gray.500\`:

| Token | Usage |
|-------|-------|
| \`bg\`, \`bg.panel\` | Page and card surfaces |
| \`bg.subtle\`, \`bg.muted\`, \`bg.emphasized\` | Wells, hover states, icon tiles, code |
| \`fg\`, \`fg.muted\`, \`fg.subtle\` | Primary, secondary, tertiary text |
| \`border\`, \`border.muted\`, \`border.emphasized\` | Hairlines, dividers, input outlines |
| \`colorPalette.solid\` / \`colorPalette.contrast\` | Brand fills (follows the theme preset) |
| \`colorPalette="red"\` / \`"green"\` / \`"orange"\` | Destructive, success, warning only |

- \`brand\` is the default \`colorPalette\` on \`html\`; don't pass \`colorPalette\` unless you need a status color (and never \`colorScheme\`, which is v2)`,
    colorRules: `- Status indicators: \`Badge\` with \`colorPalette\` — don't hand-roll colored pills
- Radii: \`l1\` / \`l2\` / \`l3\` for surfaces, \`control\` for buttons, inputs and badges (pills by default, square in the \`neutral\` preset)`,
    dark: `- Semantic tokens adapt automatically — using them is the whole dark mode strategy
- NEVER hardcode \`bg="white"\` or \`color="black"\`. Use \`bg="bg"\` / \`color="fg"\`
- For one-off overrides use the \`_dark\` condition: \`borderColor={{ base: 'border', _dark: 'border.emphasized' }}\`
- The toggle is \`ColorModeButton\`; read the mode with \`useColorMode()\` from \`@/shared/hooks/use-color-mode\` (\`useColorModeValue\` no longer exists)`,
    interactions: `- **Loading**: \`Skeleton\` for content areas, \`loading\` prop on buttons. Never leave the user without feedback
- **Success/error**: toaster (\`toaster.create\`) for transient confirmations, \`StatusAlert\` for persistent messages. Never \`window.alert()\`
- **Destructive actions**: Always confirm with \`Dialog.Root role="alertdialog"\` for delete/remove. Never delete on single click
- **Hover**: cards that link somewhere use \`css={interactiveCard}\` from \`@/theme/styles\` (border darkens, soft shadow)`,
    responsive: `- **Mobile-first**: Chakra responsive props use mobile-first breakpoints (\`base\`, \`sm\`, \`md\`, \`lg\`, \`xl\`)
- **Responsive props**: \`columns={{ base: 1, md: 2, lg: 3 }}\`
- **Stack direction**: \`Stack direction={{ base: 'column', md: 'row' }}\` for responsive stacking
- Layouts already wrap content in \`<Container>\` — pages should not add another`,
    componentSkill: `see the \`chakra-ui-react\` skill`,
  },
  vue: {
    brand: `(the \`primary\` color; the \`mono\` accent draws it in ink and white)`,
    hairlines: `Separate surfaces with \`border-default\` / \`border-muted\`; reserve the panel shadow (\`--shadow-panel\`) for floating layers`,
    spacing: `Use Tailwind's spacing scale consistently (1 = 4px):`,
    spacingRules: `- Use \`flex flex-col gap-*\` / \`flex gap-*\` for sibling spacing — not margins on individual items
- Page content: the main layout already wraps pages in \`UContainer class="max-w-6xl"\`
- Cards: \`UCard\` sets its own padding — change it for the whole app in \`src/theme/ui-config.ts\`, not per use`,
    typography: `Inter Variable is the body and heading font; headings use \`tracking-tight\`, display text \`tracking-display\`.`,
    typographyRows: `| Hero | \`<h1 class="text-5xl md:text-7xl font-semibold tracking-display text-highlighted">\` | Landing pages only |
| Page title | \`<PageHeader title="..." />\` (renders \`<h1 class="text-3xl font-semibold tracking-tight">\`) | One per page |
| Section title | \`<h2 class="text-2xl font-semibold tracking-tight text-highlighted">\` | Major sections |
| Sub-section | \`<h3 class="text-xl font-semibold text-highlighted">\` | Groups within a section |
| Card title | \`<h3 class="font-semibold tracking-tight text-highlighted">\` | Card headings |
| Body | \`<p>\` | Paragraphs, descriptions |
| Secondary | \`<p class="text-muted">\` | Descriptions, helper copy |
| Caption | \`<p class="text-xs text-dimmed">\` | Metadata, timestamps |`,
    typographyRules: `- Max reading width: \`max-w-prose\` for long-form text
- Code and commands: \`<code class="font-mono">\` or the shared \`CommandSnippet\``,
    color: `Use Nuxt UI's semantic classes — never hex/rgb values or raw palette classes like \`text-gray-500\`:

| Class | Usage |
|-------|-------|
| \`bg-default\` | Page and card surfaces |
| \`bg-muted\`, \`bg-elevated\`, \`bg-accented\` | Wells, hover states, icon tiles, code |
| \`text-highlighted\`, \`text-default\`, \`text-muted\`, \`text-dimmed\` | Headings, primary, secondary, tertiary text |
| \`border-default\`, \`border-muted\`, \`border-accented\` | Hairlines, dividers, input outlines |
| \`bg-primary\` / \`text-primary\` | Brand fills (follows the theme preset) |
| \`color="error"\` / \`"success"\` / \`"warning"\` | Destructive, success, warning only |

- \`primary\` is every component's default color; pass \`color\` only for a status or \`neutral\``,
    colorRules: `- Status indicators: \`UBadge\` with \`color\` — don't hand-roll colored pills
- Radii come from \`--ui-radius\` (zero in the \`neutral\` preset); buttons, inputs and badges are pills through \`src/theme/ui-config.ts\``,
    dark: `- The semantic classes adapt automatically — using them is the whole dark mode strategy
- NEVER hardcode \`bg-white\` or \`text-black\`. Use \`bg-default\` / \`text-default\`
- For one-off overrides use the \`dark:\` variant: \`class="border-default dark:border-accented"\`
- The toggle is \`ColorModeButton\`; read the mode with \`useColorMode()\` from \`@/shared/composables/use-color-mode\``,
    interactions: `- **Loading**: \`USkeleton\` for content areas, \`:loading\` on \`UButton\`. Never leave the user without feedback
- **Success/error**: a toast (\`useToast().add(...)\`) for transient confirmations, \`StatusAlert\` for persistent messages. Never \`window.alert()\`
- **Destructive actions**: Always confirm before delete/remove. Never delete on single click
- **Hover**: cards that link somewhere use the \`interactive-card\` class (border darkens, soft shadow)`,
    responsive: `- **Mobile-first**: Tailwind breakpoint prefixes (\`sm:\`, \`md:\`, \`lg:\`, \`xl:\`) apply from that width up
- **Grids**: \`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3\`
- **Stacking**: \`flex flex-col md:flex-row\` for responsive stacking
- Layouts already wrap content in \`<UContainer>\` — pages should not add another`,
    componentSkill: `see the \`nuxt-ui\` skill`,
  },
}
