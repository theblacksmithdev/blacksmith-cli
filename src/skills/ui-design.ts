import type { Skill, SkillContext } from './types.js'

export const uiDesignSkill: Skill = {
  id: 'ui-design',
  name: 'UI/UX Design System',
  description: 'Modern flat design principles, spacing, typography, color, layout patterns, and interaction guidelines aligned with the Chakra UI design language.',

  render(_ctx: SkillContext): string {
    return `## UI/UX Design System — Modern Flat Design

> **Design philosophy: Clean, flat, content-first.**
> Chakra UI follows a clean design language similar to Anthropic, Apple, Linear, Vercel, and OpenAI — minimal chrome, generous whitespace, subtle depth, and purposeful motion. Every UI you build must conform to this standard.

### Core Principles

1. **Flat over skeuomorphic** — No gradients on surfaces, no heavy drop shadows, no bevels. Use solid colors, subtle borders, and minimal \`shadow-sm\` / \`shadow-md\` only where elevation is meaningful (cards, dropdowns, modals).
2. **Content over decoration** — UI exists to present content, not to look busy. Remove any element that doesn't serve the user. If a section looks empty, the content is the problem — not the lack of decorative elements.
3. **Whitespace is a feature** — Generous padding and margins create hierarchy and breathing room. Cramped UIs feel cheap. When in doubt, add more space.
4. **Consistency over creativity** — Every page should feel like part of the same app. Use the same spacing scale, the same component patterns, the same interaction behaviors everywhere.
5. **Progressive disclosure** — Show only what's needed at each level. Use expandable sections, tabs, dialogs, and drill-down navigation to manage complexity. Don't overwhelm with everything at once.

### Spacing System

Use Chakra UI's spacing scale consistently. Chakra uses a numeric spacing scale (1 = 4px, 2 = 8px, etc.).

| Scale | Value | Use for |
|-------|-------|---------|
| \`1\`–\`2\` | 4–8px | Inline gaps, icon-to-text spacing, tight badge padding |
| \`3\`–\`4\` | 12–16px | Inner component padding, gap between related items |
| \`5\`–\`6\` | 20–24px | Card padding, section inner spacing |
| \`8\` | 32px | Gap between sections within a page |
| \`10\`–\`12\` | 40–48px | Gap between major page sections |
| \`16\`–\`20\` | 64–80px | Page-level vertical padding (hero, landing sections) |

**Rules:**
- Use \`spacing\` (via \`VStack\`, \`HStack\`, \`SimpleGrid\`) for spacing between siblings — not margin on individual items
- Use \`VStack spacing={...}\` for vertical rhythm within a section
- Page content padding: use \`Container\` which handles responsive horizontal padding
- Card body padding: \`p={6}\` standard, \`p={4}\` for compact cards
- Never mix spacing approaches in the same context — pick spacing OR margin, not both

### Typography

Use \`Heading\` and \`Text\` components from \`@chakra-ui/react\`. Do NOT style raw HTML headings.

**Hierarchy:**
| Level | Component | Use for |
|-------|-----------|---------|
| Page title | \`<Heading as="h1" size="2xl">\` | One per page. The main heading. |
| Section title | \`<Heading as="h2" size="xl">\` | Major sections within a page |
| Sub-section | \`<Heading as="h3" size="lg">\` | Groups within a section |
| Card title | \`<Heading as="h4" size="md">\` | Card headings |
| Body | \`<Text>\` | Paragraphs, descriptions |
| Caption/label | \`<Text fontSize="sm" color="gray.500">\` | Secondary info, metadata, timestamps |
| Overline | \`<Text fontSize="xs" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">\` | Category labels, section overlines |

**Rules:**
- One \`h1\` per page — it's the page title
- Headings should never skip levels (h1 -> h3 without h2)
- Body text: \`fontSize="sm"\` (14px) for dense UIs (tables, sidebars), \`fontSize="md"\` (16px) for reading content
- Max reading width: \`maxW="prose"\` (~65ch) for long-form text. Never let paragraphs stretch full-width
- Use \`color="gray.500"\` or theme-aware \`useColorModeValue('gray.600', 'gray.400')\` for secondary text
- Font weight: \`fontWeight="medium"\` (500) for labels, \`fontWeight="semibold"\` (600) for headings, \`fontWeight="bold"\` (700) sparingly

### Color

Use Chakra UI's theme-aware color tokens, never hardcoded colors.

**Semantic palette (via colorScheme and theme tokens):**
| Token | Usage |
|-------|-------|
| \`blue\` (colorScheme) | Primary actions (buttons, links, active states) |
| \`gray\` (colorScheme) | Secondary actions, subtle backgrounds |
| \`red\` (colorScheme) | Delete, error, danger states |
| \`green\` (colorScheme) | Success states |
| \`yellow\` / \`orange\` | Warning states |

**Rules:**
- Use \`useColorModeValue()\` for any colors that need to adapt between light and dark mode
- Status colors: use \`Badge\` with \`colorScheme\` (\`green\`, \`red\`, \`blue\`, \`gray\`) — don't hand-roll colored pills.
- Maximum 2–3 colors visible at any time (primary + foreground + muted). Colorful UIs feel noisy.
- Every UI must render correctly in both light and dark mode. See the Dark Mode section below for the full rules.

### Layout Patterns

**Page layout:**
\`\`\`tsx
<Box as="main">
  <Container maxW="container.xl">
    <VStack spacing={8} align="stretch">
      {/* Page header */}
      <Flex align="center" justify="space-between">
        <VStack spacing={1} align="start">
          <Heading as="h1" size="2xl">Page Title</Heading>
          <Text color="gray.500">Brief description of this page</Text>
        </VStack>
        <Button colorScheme="blue">Primary Action</Button>
      </Flex>

      {/* Page content sections */}
      <VStack spacing={6} align="stretch">
        {/* ... */}
      </VStack>
    </VStack>
  </Container>
</Box>
\`\`\`

**Card-based content:**
\`\`\`tsx
<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
  {items.map((item) => (
    <Card key={item.id}>
      <CardHeader>
        <Heading size="md">{item.title}</Heading>
        <Text fontSize="sm" color="gray.500">{item.description}</Text>
      </CardHeader>
      <CardBody>
        {/* Content */}
      </CardBody>
    </Card>
  ))}
</SimpleGrid>
\`\`\`

**Sidebar + main content:**
\`\`\`tsx
<Flex minH="100vh">
  <Box as="aside" w="250px">{/* Nav items */}</Box>
  <Box as="main" flex={1}>
    <Container maxW="container.xl">{/* Page content */}</Container>
  </Box>
</Flex>
\`\`\`

**Section with centered content (landing pages):**
\`\`\`tsx
<Box as="section" py={{ base: 16, sm: 20 }}>
  <Container maxW="container.xl">
    <VStack spacing={4} align="center" textAlign="center">
      <Heading as="h2" size="xl">Section Title</Heading>
      <Text color="gray.500" maxW="2xl">
        A concise description that explains the value proposition.
      </Text>
    </VStack>
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mt={12}>
      {/* Feature cards or content */}
    </SimpleGrid>
  </Container>
</Box>
\`\`\`

### Component Patterns

**Empty states:**
\`\`\`tsx
// GOOD — uses a well-structured empty state with Chakra components
<VStack spacing={4} align="center" py={12} textAlign="center">
  <Icon as={Inbox} boxSize={12} color="gray.400" />
  <Heading size="md">No messages yet</Heading>
  <Text color="gray.500">Messages from your team will appear here.</Text>
  <Button colorScheme="blue">Send a message</Button>
</VStack>

// BAD — hand-rolled empty state with raw HTML
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Inbox className="h-12 w-12 text-gray-400 mb-4" />
  <h3 className="text-lg font-medium">No messages yet</h3>
  <p className="text-gray-500 mt-1">Messages from your team will appear here.</p>
</div>
\`\`\`

**Stats/metrics:**
\`\`\`tsx
// GOOD — uses Chakra Stat component
<SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
  <Stat>
    <StatLabel>Total Users</StatLabel>
    <StatNumber>2,847</StatNumber>
    <StatHelpText><StatArrow type="increase" />12%</StatHelpText>
  </Stat>
  <Stat>
    <StatLabel>Revenue</StatLabel>
    <StatNumber>$48,290</StatNumber>
    <StatHelpText><StatArrow type="increase" />8%</StatHelpText>
  </Stat>
</SimpleGrid>
\`\`\`

**Loading states:**
\`\`\`tsx
// GOOD — Skeleton matches the layout structure
<VStack spacing={4} align="stretch">
  <Skeleton h="32px" w="200px" />
  <SkeletonText noOfLines={2} />
  <SimpleGrid columns={3} spacing={4}>
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} h="128px" />
    ))}
  </SimpleGrid>
</VStack>

// BAD — generic spinner with no layout hint
<div className="flex justify-center py-12">
  <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full" />
</div>
\`\`\`

### Dark Mode & Light Mode

> **CRITICAL: Every screen, component, and custom style MUST look correct in both light and dark mode. No exceptions.**

Chakra UI supports color mode via \`useColorMode()\` and \`useColorModeValue()\`. All built-in components automatically adapt.

**Rules:**
- Use \`useColorModeValue()\` for any custom colors that need to differ between modes
- NEVER hardcode colors that only work in one mode. Use theme tokens or \`useColorModeValue()\`.
- NEVER use \`bg="white"\` or \`bg="black"\`. Use \`bg={useColorModeValue('white', 'gray.800')}\` or Chakra semantic tokens.
- All Chakra UI components automatically adapt to color mode — leverage this.

### Interactions & Feedback

- **Hover states**: Subtle background change — Chakra components handle this automatically
- **Focus**: Chakra components include accessible focus rings by default
- **Loading feedback**: Show \`Spinner\` on buttons via \`isLoading\` prop. Use \`Skeleton\` for content areas. Never leave the user without feedback during loading
- **Success/error feedback**: Use \`useToast()\` for transient confirmations. Use \`Alert\` for persistent messages. Never use \`window.alert()\`
- **Confirmation before destructive actions**: Always use \`AlertDialog\` for delete/remove actions. Never delete on single click

### Responsive Design

- **Mobile-first**: Chakra's responsive props use mobile-first breakpoints
- **Breakpoints**: \`sm\` (480px), \`md\` (768px), \`lg\` (992px), \`xl\` (1280px), \`2xl\` (1536px)
- **Responsive props**: \`columns={{ base: 1, md: 2, lg: 3 }}\` — single column on mobile, expand on larger screens
- **Hide/show**: Use Chakra's \`Show\` and \`Hide\` components or \`display={{ base: 'none', md: 'block' }}\`
- **Touch targets**: Minimum 44x44px for interactive elements on mobile. Use \`Button size="lg"\` and adequate padding
- **Stack direction**: Use \`Stack direction={{ base: 'column', md: 'row' }}\` for responsive stacking
- **Container**: Always wrap page content in \`<Container>\` — it handles responsive horizontal padding

### Anti-Patterns — NEVER Do These

| Anti-pattern | What to do instead |
|---|---|
| Raw \`<div>\` with flex/grid classes | Use \`Flex\`, \`VStack\`, \`HStack\`, \`SimpleGrid\` |
| Raw \`<h1>\`-\`<h6>\` tags | Use \`Heading\` with \`as\` and \`size\` props |
| Raw \`<p>\` tags | Use \`Text\` |
| Heavy box shadows | Use Chakra's built-in shadow prop: \`shadow="sm"\`, \`shadow="md"\` |
| Gradient backgrounds on surfaces | Use solid backgrounds |
| Custom scrollbar CSS hacks | Use Chakra's styling system |
| Animated entrances (fade-in, slide-up) | Content should appear instantly. Only animate user-triggered changes |
| Using \`<br />\` for spacing | Use \`VStack spacing={...}\` or Chakra spacing props |
| Inline styles (\`style={{ ... }}\`) | Use Chakra style props (\`p\`, \`m\`, \`bg\`, \`color\`, etc.) |
| Hardcoded color values | Use theme tokens and \`useColorModeValue()\` |
`
  },
}
