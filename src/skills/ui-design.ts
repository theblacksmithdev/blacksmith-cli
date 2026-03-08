import type { Skill, SkillContext } from './types.js'

export const uiDesignSkill: Skill = {
  id: 'ui-design',
  name: 'UI/UX Design System',
  description: 'Modern flat design principles, spacing, typography, color, layout patterns, and interaction guidelines aligned with the BlacksmithUI design language.',

  render(_ctx: SkillContext): string {
    return `## UI/UX Design System — Modern Flat Design

> **Design philosophy: Clean, flat, content-first.**
> BlacksmithUI follows the same design language as Anthropic, Apple, Linear, Vercel, and OpenAI — minimal chrome, generous whitespace, subtle depth, and purposeful motion. Every UI you build must conform to this standard.

### Core Principles

1. **Flat over skeuomorphic** — No gradients on surfaces, no heavy drop shadows, no bevels. Use solid colors, subtle borders, and minimal \`shadow-sm\` / \`shadow-md\` only where elevation is meaningful (cards, dropdowns, modals).
2. **Content over decoration** — UI exists to present content, not to look busy. Remove any element that doesn't serve the user. If a section looks empty, the content is the problem — not the lack of decorative elements.
3. **Whitespace is a feature** — Generous padding and margins create hierarchy and breathing room. Cramped UIs feel cheap. When in doubt, add more space.
4. **Consistency over creativity** — Every page should feel like part of the same app. Use the same spacing scale, the same component patterns, the same interaction behaviors everywhere.
5. **Progressive disclosure** — Show only what's needed at each level. Use expandable sections, tabs, dialogs, and drill-down navigation to manage complexity. Don't overwhelm with everything at once.

### Spacing System

Use Tailwind's spacing scale consistently. Do NOT use arbitrary values (\`p-[13px]\`) — stick to the system.

| Scale | Value | Use for |
|-------|-------|---------|
| \`1\`–\`2\` | 4–8px | Inline gaps, icon-to-text spacing, tight badge padding |
| \`3\`–\`4\` | 12–16px | Inner component padding, gap between related items |
| \`5\`–\`6\` | 20–24px | Card padding, section inner spacing |
| \`8\` | 32px | Gap between sections within a page |
| \`10\`–\`12\` | 40–48px | Gap between major page sections |
| \`16\`–\`20\` | 64–80px | Page-level vertical padding (hero, landing sections) |

**Rules:**
- Use \`gap\` (via \`Flex\`, \`Stack\`, \`Grid\`) for spacing between siblings — not margin on individual items
- Use \`Stack gap={...}\` for vertical rhythm within a section
- Page content padding: \`px-4 sm:px-6 lg:px-8\` (use \`Container\` which handles this)
- Card body padding: \`p-6\` standard, \`p-4\` for compact cards
- Never mix spacing approaches in the same context — pick gap OR margin, not both

### Typography

Use \`Typography\` and \`Text\` components from \`@blacksmith-ui/react\`. Do NOT style raw HTML headings.

**Hierarchy:**
| Level | Component | Use for |
|-------|-----------|---------|
| Page title | \`<Typography variant="h1">\` | One per page. The main heading. |
| Section title | \`<Typography variant="h2">\` | Major sections within a page |
| Sub-section | \`<Typography variant="h3">\` | Groups within a section |
| Card title | \`<Typography variant="h4">\` or \`CardTitle\` | Card headings |
| Body | \`<Text>\` | Paragraphs, descriptions |
| Caption/label | \`<Text size="sm" color="muted">\` | Secondary info, metadata, timestamps |
| Overline | \`<Text size="xs" weight="medium" className="uppercase tracking-wide">\` | Category labels, section overlines |

**Rules:**
- One \`h1\` per page — it's the page title
- Headings should never skip levels (h1 → h3 without h2)
- Body text: \`text-sm\` (14px) for dense UIs (tables, sidebars), \`text-base\` (16px) for reading content
- Line height: use Tailwind defaults (\`leading-relaxed\` for body copy, \`leading-tight\` for headings)
- Max reading width: \`max-w-prose\` (~65ch) for long-form text. Never let paragraphs stretch full-width
- Use \`text-muted-foreground\` for secondary text, never gray hardcoded values
- Font weight: \`font-medium\` (500) for labels and emphasis, \`font-semibold\` (600) for headings, \`font-bold\` (700) sparingly

### Color

Use design tokens (CSS variables), never hardcoded colors.

**Semantic palette:**
| Token | Usage |
|-------|-------|
| \`primary\` | Primary actions (buttons, links, active states) |
| \`secondary\` | Secondary actions, subtle backgrounds |
| \`destructive\` | Delete, error, danger states |
| \`muted\` | Backgrounds for subtle sections, disabled states |
| \`accent\` | Highlights, hover states, focus rings |
| \`foreground\` | Primary text |
| \`muted-foreground\` | Secondary/helper text |
| \`border\` | Borders, dividers |
| \`card\` | Card backgrounds |
| \`background\` | Page background |

**Rules:**
- NEVER use Tailwind color literals (\`text-gray-500\`, \`bg-blue-600\`, \`border-slate-200\`, \`bg-white\`, \`bg-black\`). Always use semantic tokens (\`text-muted-foreground\`, \`bg-primary\`, \`border-border\`, \`bg-background\`). This is non-negotiable — hardcoded colors break dark mode.
- Status colors: use \`Badge\` variants (\`default\`, \`secondary\`, \`destructive\`, \`outline\`) — don't hand-roll colored pills.
- Maximum 2–3 colors visible at any time (primary + foreground + muted). Colorful UIs feel noisy.
- Every UI must render correctly in both light and dark mode. See the Dark Mode section below for the full rules.

### Layout Patterns

**Page layout:**
\`\`\`tsx
<Box as="main">
  <Container>
    <Stack gap={8}>
      {/* Page header */}
      <Flex align="center" justify="between">
        <Stack gap={1}>
          <Typography variant="h1">Page Title</Typography>
          <Text color="muted">Brief description of this page</Text>
        </Stack>
        <Button>Primary Action</Button>
      </Flex>

      {/* Page content sections */}
      <Stack gap={6}>
        {/* ... */}
      </Stack>
    </Stack>
  </Container>
</Box>
\`\`\`

**Card-based content:**
\`\`\`tsx
<Grid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
  {items.map((item) => (
    <Card key={item.id}>
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  ))}
</Grid>
\`\`\`

**Sidebar + main content:**
\`\`\`tsx
<Flex className="min-h-screen">
  <Sidebar>{/* Nav items */}</Sidebar>
  <Box as="main" className="flex-1">
    <Container>{/* Page content */}</Container>
  </Box>
</Flex>
\`\`\`

**Section with centered content (landing pages):**
\`\`\`tsx
<Box as="section" className="py-16 sm:py-20">
  <Container>
    <Stack gap={4} align="center" className="text-center">
      <Typography variant="h2">Section Title</Typography>
      <Text color="muted" className="max-w-2xl">
        A concise description that explains the value proposition.
      </Text>
    </Stack>
    <Grid columns={{ base: 1, md: 3 }} gap={8} className="mt-12">
      {/* Feature cards or content */}
    </Grid>
  </Container>
</Box>
\`\`\`

### Component Patterns

**Empty states:**
\`\`\`tsx
// GOOD — uses EmptyState component
<EmptyState
  icon={Inbox}
  title="No messages yet"
  description="Messages from your team will appear here."
  action={<Button>Send a message</Button>}
/>

// BAD — hand-rolled empty state
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Inbox className="h-12 w-12 text-gray-400 mb-4" />
  <h3 className="text-lg font-medium">No messages yet</h3>
  <p className="text-gray-500 mt-1">Messages from your team will appear here.</p>
</div>
\`\`\`

**Stats/metrics:**
\`\`\`tsx
// GOOD — uses StatCard
<Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
  <StatCard label="Total Users" value="2,847" trend="+12%" />
  <StatCard label="Revenue" value="$48,290" trend="+8%" />
</Grid>

// BAD — hand-rolled stat cards
<div className="grid grid-cols-4 gap-4">
  <div className="bg-white rounded-lg p-6 shadow">
    <p className="text-sm text-gray-500">Total Users</p>
    <p className="text-2xl font-bold">2,847</p>
  </div>
</div>
\`\`\`

**Loading states:**
\`\`\`tsx
// GOOD — Skeleton matches the layout structure
<Stack gap={4}>
  <Skeleton className="h-8 w-48" />       {/* Title */}
  <Skeleton className="h-4 w-96" />       {/* Description */}
  <Grid columns={3} gap={4}>
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-32" />
    ))}
  </Grid>
</Stack>

// BAD — generic spinner with no layout hint
<div className="flex justify-center py-12">
  <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full" />
</div>
\`\`\`

### Dark Mode & Light Mode

> **CRITICAL: Every screen, component, and custom style MUST look correct in both light and dark mode. No exceptions.**

BlacksmithUI uses the \`.dark\` class strategy on \`<html>\`. All semantic CSS variables automatically switch between light and dark values. Your job is to never break this.

**Rules:**
- NEVER hardcode colors. \`text-gray-500\`, \`bg-white\`, \`bg-slate-900\`, \`border-gray-200\` — all of these break in one mode or the other. Use semantic tokens: \`text-muted-foreground\`, \`bg-background\`, \`bg-card\`, \`border-border\`.
- NEVER use \`bg-white\` or \`bg-black\`. Use \`bg-background\` (page), \`bg-card\` (elevated surfaces), \`bg-muted\` (subtle sections).
- NEVER use \`text-black\` or \`text-white\`. Use \`text-foreground\` (primary text), \`text-muted-foreground\` (secondary), \`text-primary-foreground\` (text on primary-colored backgrounds).
- NEVER use hardcoded shadows like \`shadow-[0_2px_8px_rgba(0,0,0,0.1)]\`. Use Tailwind shadow utilities (\`shadow-sm\`, \`shadow-md\`) which respect the theme.
- NEVER use opacity-based overlays with hardcoded colors (\`bg-black/50\`). Use \`bg-background/80\` or let overlay components (\`Dialog\`, \`Sheet\`) handle it.
- SVG fills and strokes: use \`currentColor\` or \`fill-foreground\` / \`stroke-border\` — never \`fill-black\` or \`stroke-gray-300\`.
- Image assets: if you use decorative images or illustrations, ensure they work on both backgrounds or use \`dark:hidden\` / \`hidden dark:block\` to swap variants.

**Safe color tokens (always use these):**
| Need | Light mode maps to | Dark mode maps to | Use |
|------|----|----|-----|
| Page background | white/light gray | near-black | \`bg-background\` |
| Card/surface | white | dark gray | \`bg-card\` |
| Subtle background | light gray | darker gray | \`bg-muted\` |
| Primary text | near-black | near-white | \`text-foreground\` |
| Secondary text | medium gray | lighter gray | \`text-muted-foreground\` |
| Borders | light gray | dark gray | \`border-border\` |
| Input borders | light gray | dark gray | \`border-input\` |
| Focus ring | brand color | brand color | \`ring-ring\` |
| Primary action | brand color | brand color | \`bg-primary text-primary-foreground\` |
| Destructive | red | red | \`bg-destructive text-destructive-foreground\` |

**Testing checklist (mental model):**
Before considering any UI complete, verify these in your head:
1. Does every text element use \`foreground\`, \`muted-foreground\`, or \`*-foreground\` tokens?
2. Does every background use \`background\`, \`card\`, \`muted\`, or \`primary\`/\`secondary\`/\`accent\` tokens?
3. Does every border use \`border\`, \`input\`, or \`ring\` tokens?
4. Are there ANY hex values, rgb values, or Tailwind color names (gray, slate, blue, etc.) in the code? If yes, replace them.
5. Do hover/focus/active states also use semantic tokens? (\`hover:bg-muted\` not \`hover:bg-gray-100\`)

### Interactions & Feedback

- **Hover states**: Subtle background change (\`hover:bg-muted\`) — not color shifts or scale transforms
- **Focus**: Use focus-visible ring (\`focus-visible:ring-2 ring-ring\`). BlacksmithUI components handle this automatically
- **Transitions**: \`transition-colors duration-150\` for color changes. No bounces, no springs, no dramatic animations
- **Click feedback**: Use \`active:scale-[0.98]\` only on buttons and interactive cards, never on text or static elements
- **Loading feedback**: Show \`Spinner\` on buttons during async actions. Use \`Skeleton\` for content areas. Never leave the user without feedback during loading
- **Success/error feedback**: Use \`useToast()\` for transient confirmations. Use \`Alert\` for persistent messages. Never use \`window.alert()\`
- **Confirmation before destructive actions**: Always use \`AlertDialog\` for delete/remove actions. Never delete on single click

### Responsive Design

- **Mobile-first**: Write base styles for mobile, add \`sm:\`/\`md:\`/\`lg:\` for larger screens
- **Breakpoints**: \`sm\` (640px), \`md\` (768px), \`lg\` (1024px), \`xl\` (1280px)
- **Grid collapse**: \`Grid columns={{ base: 1, md: 2, lg: 3 }}\` — single column on mobile, expand on larger screens
- **Hide/show**: Use \`hidden md:block\` / \`md:hidden\` to toggle elements across breakpoints
- **Touch targets**: Minimum 44×44px for interactive elements on mobile. Use \`Button size="lg"\` and adequate padding
- **Stack on mobile, row on desktop**: Use \`Flex direction={{ base: 'column', md: 'row' }}\` or \`Stack\` that switches direction
- **Container**: Always wrap page content in \`<Container>\` — it handles responsive horizontal padding

### Anti-Patterns — NEVER Do These

| Anti-pattern | What to do instead |
|---|---|
| Hardcoded colors (\`text-gray-500\`, \`bg-blue-600\`) | Use semantic tokens (\`text-muted-foreground\`, \`bg-primary\`) |
| Heavy box shadows (\`shadow-xl\`, \`shadow-2xl\`) | Use \`shadow-sm\` on cards, \`shadow-md\` on elevated overlays only |
| Rounded pill shapes (\`rounded-full\`) on cards/containers | Use \`rounded-lg\` or \`rounded-md\` (controlled by \`--radius\`) |
| Gradient backgrounds on surfaces | Use solid \`bg-card\` or \`bg-background\` |
| Decorative borders (\`border-l-4 border-blue-500\`) | Use \`Divider\` or \`border-border\` |
| Custom scrollbars with CSS hacks | Use \`ScrollArea\` |
| Animated entrances (fade-in, slide-up on mount) | Content should appear instantly. Only animate user-triggered changes |
| Centering with \`absolute inset-0 flex items-center\` | Use \`Flex align="center" justify="center"\` |
| Using \`<br />\` for spacing | Use \`Stack gap={...}\` or margin utilities |
| Multiple font sizes in close proximity | Keep nearby text within 1–2 size steps |
| Dense walls of text | Break into sections with headings, cards, or spacing |
| Colored backgrounds on every section | Use \`bg-background\` as default, \`bg-muted\` sparingly for contrast |
| Over-using badges/tags on everything | Badges are for status and categories, not decoration |
| Inline styles (\`style={{ ... }}\`) | Use Tailwind classes via \`className\` |
| \`bg-white\` / \`bg-black\` / \`bg-slate-*\` | Use \`bg-background\`, \`bg-card\`, \`bg-muted\` |
| \`text-black\` / \`text-white\` / \`text-gray-*\` | Use \`text-foreground\`, \`text-muted-foreground\` |
| \`border-gray-*\` / \`border-slate-*\` | Use \`border-border\`, \`border-input\` |
| Hex/rgb values in className or style | Use CSS variable tokens exclusively |
| UI that only looks right in light mode | Always verify both modes — use semantic tokens throughout |
`
  },
}
