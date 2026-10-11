import type { Skill, SkillContext } from './types.js'

export const uiDesignSkill: Skill = {
  id: 'ui-design',
  name: 'UI/UX Design System',
  description: 'Design principles, spacing, typography, color, layout patterns, and interaction guidelines for the OpenAI-inspired Chakra UI v3 theme.',

  render(_ctx: SkillContext): string {
    return `## UI/UX Design System — OpenAI-Inspired Monochrome

> **Design philosophy: Quiet, precise, content-first.**
> The theme follows the OpenAI / ChatGPT design language — monochrome surfaces, hairline borders, pill-shaped controls, tight Inter typography, and almost no decoration. The system lives in \`src/theme/\`; change it there, never per component.

### Core Principles

1. **Monochrome first** — Primary actions are ink-black in light mode and white in dark mode (the \`brand\` palette). Color is reserved for status (error, success, warning). Never add decorative color
2. **Flat with hairlines** — No gradients, no heavy shadows. Separate surfaces with \`border\` / \`border.muted\`; reserve the \`panel\` shadow for floating layers (menus, popovers, hovered cards)
3. **Whitespace is a feature** — Generous padding and margins create hierarchy. When in doubt, add more space
4. **Consistency over creativity** — Reuse \`PageHeader\`, \`InfoCard\`, \`StatusAlert\`, \`StatusPage\` so every page feels like the same app
5. **Progressive disclosure** — Show only what's needed. Use tabs, dialogs, and drill-down navigation to manage complexity

### Spacing

Use Chakra UI's numeric spacing scale consistently (1 = 4px):

| Scale | Use for |
|-------|---------|
| \`1\`–\`2\` | Icon-to-text gaps, tight badge padding |
| \`3\`–\`4\` | Inner component padding, gap between related items |
| \`5\`–\`6\` | Card padding, form field spacing |
| \`8\` | Gap between sections within a page |
| \`12\`–\`20\` | Gap between major page sections, hero padding |

- Use \`Stack gap="..."\` / \`HStack gap="..."\` for sibling spacing — not margin on individual items (\`spacing\` is v2 and does not exist)
- Page content: the main layout already wraps pages in \`Container maxW="6xl"\`
- Cards: the card recipe sets padding via \`size\` (\`sm\` | \`md\` | \`lg\`) — don't override with \`p\`

### Typography

Inter Variable is the body and heading font; headings use tight letter-spacing from the heading recipe.

| Level | Component | Use for |
|-------|-----------|---------|
| Hero | \`<Heading as="h1" fontSize={{ base: '5xl', md: '7xl' }} letterSpacing="display">\` | Landing pages only |
| Page title | \`<PageHeader title="..." />\` (renders \`Heading as="h1" size="2xl"\`) | One per page |
| Section title | \`<Heading as="h2" size="xl">\` | Major sections |
| Sub-section | \`<Heading as="h3" size="lg">\` | Groups within a section |
| Card title | \`<Card.Title>\` | Card headings |
| Body | \`<Text>\` | Paragraphs, descriptions |
| Secondary | \`<Text color="fg.muted">\` | Descriptions, helper copy |
| Caption | \`<Text textStyle="xs" color="fg.subtle">\` | Metadata, timestamps |

- One \`h1\` per page. Never skip heading levels
- Max reading width: \`maxW="prose"\` for long-form text
- Code and commands: \`Code\` or the shared \`CommandSnippet\`

### Color

Use semantic tokens — never hex/rgb values or raw palette steps like \`gray.500\`:

| Token | Usage |
|-------|-------|
| \`bg\`, \`bg.panel\` | Page and card surfaces |
| \`bg.subtle\`, \`bg.muted\`, \`bg.emphasized\` | Wells, hover states, icon tiles, code |
| \`fg\`, \`fg.muted\`, \`fg.subtle\` | Primary, secondary, tertiary text |
| \`border\`, \`border.muted\`, \`border.emphasized\` | Hairlines, dividers, input outlines |
| \`colorPalette.solid\` / \`colorPalette.contrast\` | Brand fills (follows the theme preset) |
| \`colorPalette="red"\` / \`"green"\` / \`"orange"\` | Destructive, success, warning only |

- \`brand\` is the default \`colorPalette\` on \`html\`; don't pass \`colorPalette\` unless you need a status color (and never \`colorScheme\`, which is v2)
- Maximum 2–3 colors visible at once. Colorful UIs feel noisy
- Status indicators: \`Badge\` with \`colorPalette\` — don't hand-roll colored pills
- Radii: \`l1\` / \`l2\` / \`l3\` for surfaces, \`control\` for buttons, inputs and badges (pills by default, square in the \`neutral\` preset)

### Dark Mode

> **Every screen and component MUST render correctly in both light and dark mode.**

- Semantic tokens adapt automatically — using them is the whole dark mode strategy
- NEVER hardcode \`bg="white"\` or \`color="black"\`. Use \`bg="bg"\` / \`color="fg"\`
- For one-off overrides use the \`_dark\` condition: \`borderColor={{ base: 'border', _dark: 'border.emphasized' }}\`
- The toggle is \`ColorModeButton\`; read the mode with \`useColorMode()\` from \`@/shared/hooks/use-color-mode\` (\`useColorModeValue\` no longer exists)

### Interactions & Feedback

- **Loading**: \`Skeleton\` for content areas, \`loading\` prop on buttons. Never leave the user without feedback
- **Success/error**: toaster (\`toaster.create\`) for transient confirmations, \`StatusAlert\` for persistent messages. Never \`window.alert()\`
- **Destructive actions**: Always confirm with \`Dialog.Root role="alertdialog"\` for delete/remove. Never delete on single click
- **Hover**: cards that link somewhere use \`css={interactiveCard}\` from \`@/theme/styles\` (border darkens, soft shadow)
- **Touch targets**: Minimum 44x44px for interactive elements on mobile

### Responsive Design

- **Mobile-first**: Chakra responsive props use mobile-first breakpoints (\`base\`, \`sm\`, \`md\`, \`lg\`, \`xl\`)
- **Responsive props**: \`columns={{ base: 1, md: 2, lg: 3 }}\`
- **Stack direction**: \`Stack direction={{ base: 'column', md: 'row' }}\` for responsive stacking
- Layouts already wrap content in \`<Container>\` — pages should not add another

For the full component reference, see the \`chakra-ui-react\` skill.
`
  },
}
