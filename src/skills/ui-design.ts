import type { Skill, SkillContext } from './types.js'

export const uiDesignSkill: Skill = {
  id: 'ui-design',
  name: 'UI/UX Design System',
  description: 'Design principles, spacing, typography, color, layout patterns, and interaction guidelines aligned with the Chakra UI design language.',

  render(_ctx: SkillContext): string {
    return `## UI/UX Design System — Modern Flat Design

> **Design philosophy: Clean, flat, content-first.**
> Follow a design language similar to Linear, Vercel, and Stripe — minimal chrome, generous whitespace, subtle depth, and purposeful motion.

### Core Principles

1. **Flat over skeuomorphic** — No gradients on surfaces, no heavy drop shadows, no bevels. Solid colors, subtle borders, and \`shadow="sm"\` / \`shadow="md"\` only where elevation is meaningful (cards, dropdowns, modals)
2. **Content over decoration** — UI presents content, not decoration. If a section looks empty, the content is the problem — not the lack of decorative elements
3. **Whitespace is a feature** — Generous padding and margins create hierarchy. When in doubt, add more space
4. **Consistency over creativity** — Every page should feel like part of the same app. Same spacing, same patterns, same interactions
5. **Progressive disclosure** — Show only what's needed. Use tabs, dialogs, and drill-down navigation to manage complexity

### Spacing

Use Chakra UI's numeric spacing scale consistently (1 = 4px):

| Scale | Use for |
|-------|---------|
| \`1\`–\`2\` | Icon-to-text gaps, tight badge padding |
| \`3\`–\`4\` | Inner component padding, gap between related items |
| \`5\`–\`6\` | Card padding, section inner spacing |
| \`8\` | Gap between sections within a page |
| \`10\`–\`12\` | Gap between major page sections |

- Use \`VStack spacing={...}\` / \`HStack spacing={...}\` for sibling spacing — not margin on individual items
- Page content: use \`Container\` for responsive horizontal padding
- Card body: \`p={6}\` standard, \`p={4}\` for compact cards

### Typography

| Level | Component | Use for |
|-------|-----------|---------|
| Page title | \`<Heading as="h1" size="2xl">\` | One per page |
| Section title | \`<Heading as="h2" size="xl">\` | Major sections |
| Sub-section | \`<Heading as="h3" size="lg">\` | Groups within a section |
| Card title | \`<Heading as="h4" size="md">\` | Card headings |
| Body | \`<Text>\` | Paragraphs, descriptions |
| Caption | \`<Text fontSize="sm" color="gray.500">\` | Metadata, timestamps |

- One \`h1\` per page. Never skip heading levels
- Max reading width: \`maxW="prose"\` for long-form text
- Use \`useColorModeValue('gray.600', 'gray.400')\` for secondary text

### Color

Use Chakra UI theme tokens — never hardcoded hex/rgb values:

| colorScheme | Usage |
|-------------|-------|
| \`blue\` | Primary actions, active states |
| \`gray\` | Secondary actions, subtle backgrounds |
| \`red\` | Delete, error, danger |
| \`green\` | Success states |
| \`yellow\` / \`orange\` | Warning states |

- Use \`useColorModeValue()\` for any color that must adapt between light and dark mode
- Maximum 2–3 colors visible at once. Colorful UIs feel noisy
- Status indicators: use \`Badge\` with \`colorScheme\` — don't hand-roll colored pills

### Dark Mode

> **Every screen and component MUST render correctly in both light and dark mode.**

- Use \`useColorModeValue()\` for any custom colors
- NEVER hardcode \`bg="white"\` or \`bg="black"\`. Use \`bg={useColorModeValue('white', 'gray.800')}\`
- All Chakra UI components automatically adapt — leverage this

### Interactions & Feedback

- **Loading**: \`Skeleton\` for content areas, \`isLoading\` prop on buttons. Never leave the user without feedback
- **Success/error**: \`useToast()\` for transient confirmations, \`Alert\` for persistent messages. Never \`window.alert()\`
- **Destructive actions**: Always use \`AlertDialog\` for delete/remove. Never delete on single click
- **Touch targets**: Minimum 44x44px for interactive elements on mobile

### Responsive Design

- **Mobile-first**: Chakra responsive props use mobile-first breakpoints (\`base\`, \`sm\`, \`md\`, \`lg\`, \`xl\`)
- **Responsive props**: \`columns={{ base: 1, md: 2, lg: 3 }}\`
- **Stack direction**: \`Stack direction={{ base: 'column', md: 'row' }}\` for responsive stacking
- Always wrap page content in \`<Container>\` for responsive horizontal padding

For the full component reference, see the \`chakra-ui-react\` skill.
`
  },
}
