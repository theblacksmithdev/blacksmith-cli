import type { Skill, SkillContext } from './types.js'

export const chakraUiReactSkill: Skill = {
  id: 'chakra-ui-react',
  name: 'Chakra UI React',
  description: 'Core UI component library — Chakra UI v3 components for layout, typography, inputs, data display, overlays, feedback, media, and navigation.',

  render(_ctx: SkillContext): string {
    return `## Chakra UI React — Core UI Components (v3)

> **CRITICAL RULE: Every UI element MUST be built using \`@chakra-ui/react\` v3 components — including layout and typography.**
> Do NOT use raw HTML elements when a Chakra UI component exists for that purpose. There is no Tailwind in this project — never write \`className\` utility classes.
> This includes layout: use \`Stack\`, \`HStack\`, \`VStack\`, \`SimpleGrid\`, \`Box\`, \`Container\` instead of styled \`<div>\`s.
> This includes typography: use \`Heading\` and \`Text\` instead of raw \`<h1>\`–\`<h6>\`, \`<p>\`, \`<span>\`.

Chakra v3 uses **compound components** (\`Card.Root\`, \`Card.Body\`, …), \`asChild\` composition, and \`gap\` for spacing. v2 APIs (\`CardBody\`, \`FormControl\`, \`Modal\`, \`spacing\`, \`isLoading\`, \`colorScheme\`, \`as={Link}\`, \`leftIcon\`) do NOT exist — never use them.

### Layout

| Component | Use instead of | Description |
|-----------|---------------|-------------|
| \`Box\` | \`<div>\` | Base layout primitive with style props |
| \`Flex\` | \`<div style="display:flex">\` | Flexbox container (\`direction\`, \`align\`, \`justify\`, \`gap\`, \`wrap\`) |
| \`Stack\` / \`VStack\` / \`HStack\` | flex column/row wrappers | Stacks with \`gap\` (NOT \`spacing\`) |
| \`SimpleGrid\` | CSS grid wrappers | Grid container (\`columns\`, \`gap\`) |
| \`Container\` | max-width wrappers | Centered container (\`maxW="6xl"\`) |
| \`Center\` | centering hacks | Centers its child |
| \`Separator\` | \`<hr>\` or border hacks | Visual separator (replaces v2 \`Divider\`) |
| \`AspectRatio\` | padding-bottom trick | Maintain aspect ratio for content |

### Typography

| Component | Use instead of | Description |
|-----------|---------------|-------------|
| \`Text\` | \`<p>\`, \`<span>\` | Text with style props (\`textStyle\`, \`fontWeight\`, \`color\`) |
| \`Heading\` | \`<h1>\`–\`<h6>\` | Headings (\`as\`: h1–h6, \`size\`: xs … 7xl) |
| \`Code\` | \`<code>\` | Inline code |
| \`Link\` | \`<a>\` | Text link (\`variant="underline"\` or \`"plain"\`) |

### Cards & Containers

- \`Card.Root\`, \`Card.Header\`, \`Card.Body\`, \`Card.Footer\`, \`Card.Title\`, \`Card.Description\` — Use instead of styled \`<div>\` containers. \`variant\`: \`outline\` | \`elevated\` | \`subtle\`.

### Actions

- \`Button\` — Use instead of \`<button>\` or \`<a>\` styled as buttons
  - Variants: \`solid\`, \`subtle\`, \`surface\`, \`outline\`, \`ghost\`, \`plain\`
  - Sizes: \`2xs\` … \`2xl\`
  - State: \`loading\`, \`loadingText\`, \`disabled\` (NOT \`isLoading\` / \`isDisabled\`)
  - Icons go in children: \`<Button><Plus /> Create</Button>\` (no \`leftIcon\`)
  - Color: \`colorPalette="red"\` (NOT \`colorScheme\`). Omit it to use the app's \`brand\` palette.
  - As a link: \`<Button asChild><Link to="/x">Go</Link></Button>\` (NOT \`as={Link}\`)
- \`IconButton\` — Icon-only buttons; icon is the child, \`aria-label\` required
- \`Menu.Root\`, \`Menu.Trigger\`, \`Menu.Positioner\`, \`Menu.Content\`, \`Menu.Item\` (requires \`value\`), \`Menu.Separator\`, \`Menu.ItemGroup\` — render \`Menu.Positioner\` inside \`<Portal>\`
- \`Dialog.*\` with \`role="alertdialog"\` — destructive action confirmations

### Data Entry

- \`Field.Root\`, \`Field.Label\`, \`Field.HelperText\`, \`Field.ErrorText\` — Wraps every input (see \`chakra-ui-forms\` skill)
- \`Input\` — Use instead of \`<input>\`
- \`InputGroup\` (\`startElement\`, \`endElement\`) — Inputs with icons/addons
- \`Textarea\` — Use instead of \`<textarea>\`
- \`NativeSelect.Root\`, \`NativeSelect.Field\`, \`NativeSelect.Indicator\` — Use instead of \`<select>\`
- \`Select.*\` — Rich custom select (with \`createListCollection\`)
- \`Checkbox.Root\`, \`Checkbox.HiddenInput\`, \`Checkbox.Control\`, \`Checkbox.Label\` — Use instead of \`<input type="checkbox">\`
- \`RadioGroup.*\` — Use instead of \`<input type="radio">\`
- \`Switch.Root\`, \`Switch.HiddenInput\`, \`Switch.Control\`, \`Switch.Label\` — Toggle switches
- \`NumberInput.*\`, \`Slider.*\`, \`PinInput.*\` — Numeric, range and OTP inputs

### Data Display

- \`Table.Root\`, \`Table.Header\`, \`Table.Body\`, \`Table.Row\`, \`Table.ColumnHeader\`, \`Table.Cell\`, \`Table.ScrollArea\` — Use instead of \`<table>\`
- \`Badge\` — Status indicators, tags, counts (\`colorPalette\`: \`green\`, \`red\`, …)
- \`Avatar.Root\`, \`Avatar.Image\`, \`Avatar.Fallback\` (\`name\` prop → initials)
- \`Tooltip\` — Add via \`npx @chakra-ui/cli snippet add tooltip\`
- \`Stat.Root\`, \`Stat.Label\`, \`Stat.ValueText\`, \`Stat.HelpText\`, \`Stat.UpIndicator\` — Metric display
- \`Skeleton\`, \`SkeletonText\`, \`SkeletonCircle\` — Loading placeholders
- \`Spinner\` — Loading indicators
- \`Progress.*\` — Progress bars
- \`Tag.*\` — Removable tags
- \`EmptyState.Root\`, \`EmptyState.Content\`, \`EmptyState.Indicator\`, \`EmptyState.Title\`, \`EmptyState.Description\` — Empty lists

### Tabs & Accordion

- \`Tabs.Root\`, \`Tabs.List\`, \`Tabs.Trigger\`, \`Tabs.Content\` (\`value\` on trigger/content)
- \`Accordion.Root\`, \`Accordion.Item\`, \`Accordion.ItemTrigger\`, \`Accordion.ItemContent\`, \`Accordion.ItemIndicator\`

### Overlays

All overlays render their positioner inside \`<Portal>\` and are controlled with \`open\` + \`onOpenChange={(e) => setOpen(e.open)}\`.

- \`Dialog.Root\`, \`Dialog.Backdrop\`, \`Dialog.Positioner\`, \`Dialog.Content\`, \`Dialog.Header\`, \`Dialog.Title\`, \`Dialog.Body\`, \`Dialog.Footer\`, \`Dialog.CloseTrigger\`, \`Dialog.ActionTrigger\` — replaces v2 \`Modal\` / \`AlertDialog\`
- \`Drawer.*\` — Slide-out panels (same parts as \`Dialog\`)
- \`Popover.*\` — Floating content panels

### Navigation

- \`Breadcrumb.Root\`, \`Breadcrumb.List\`, \`Breadcrumb.Item\`, \`Breadcrumb.Link\`, \`Breadcrumb.Separator\`
- \`RouterLink\` from \`@/shared/components/ui/router-link\` — Chakra-styled text link with React Router (\`to\` prop)

### Feedback

- \`Alert.Root\` (\`status\`), \`Alert.Indicator\`, \`Alert.Content\`, \`Alert.Title\`, \`Alert.Description\` — Inline messages. Prefer the project's \`StatusAlert\` component.
- Toasts: add the toaster snippet (\`npx @chakra-ui/cli snippet add toaster --outdir src/shared/components/ui\`), render \`<Toaster />\` once, then call \`toaster.create({ title, type: 'success' })\`

### Hooks

- \`useDisclosure()\` — Returns \`{ open, onOpen, onClose, onToggle }\` (NOT \`isOpen\`)
- \`useBreakpointValue()\` — Responsive values based on breakpoint
- \`useMediaQuery()\` — CSS media query matching
- \`useColorMode()\` — from \`@/shared/hooks/use-color-mode\` (project hook, not Chakra)

---

### Component-First Rules

1. **Layout**: NEVER use styled \`<div>\`s or utility classes. Use \`Flex\`, \`Stack\`, \`SimpleGrid\`, \`Box\` from \`@chakra-ui/react\`.
2. **Centering/max-width**: Use \`<Container>\` and \`<Center>\`.
3. **Typography**: NEVER use raw \`<h1>\`–\`<h6>\` or \`<p>\`. Use \`<Heading as="h2" size="lg">\` or \`<Text>\`.
4. **Separators**: NEVER use \`<hr>\`. Use \`<Separator>\`.
5. **Buttons**: NEVER use \`<button>\` or \`<a>\` styled as a button. Use \`<Button>\` (with \`asChild\` for links).
6. **Inputs**: NEVER use \`<input>\`, \`<textarea>\`, \`<select>\` directly. Use the Chakra UI equivalents inside \`Field.Root\`.
7. **Cards**: Use \`Card.Root\` + parts — never a styled \`<div>\`.
8. **Tables**: Use \`Table.Root\` + parts — never raw \`<table>\`.
9. **Loading**: Use \`Skeleton\` or \`Spinner\` — never hand-rolled pulse divs.
10. **Overlays**: Use \`Dialog\`, \`Drawer\` or \`Popover\` — never custom modals.
11. **Feedback**: Use \`StatusAlert\` / \`Alert\` or toasts — never plain styled error text.
12. **Colors**: Use semantic tokens (\`fg.muted\`, \`bg.subtle\`, \`border\`) — never hex values or \`gray.500\`.

### When Raw HTML IS Acceptable

- Semantic landmarks via \`as\`: \`<Box as="main">\`, \`<Box as="header">\`, \`<Box as="footer">\`, or plain \`<main>\`/\`<section>\`/\`<nav>\` wrapping Chakra layout
- \`<Link>\` from react-router-dom — always wrapped: \`<Button asChild>\`, \`<Link asChild>\`, \`<LinkOverlay asChild>\`, or use \`RouterLink\`
- Icon components from \`lucide-react\`
- \`<form>\` element (with Chakra \`Field\` components inside)

### Design Tokens & Theming

- The app is wrapped in \`Provider\` from \`@/shared/components/ui/provider\` (\`<ChakraProvider value={system}>\`)
- The system lives in \`src/theme/\`: \`index.ts\` (\`createSystem(defaultConfig, config)\`), \`tokens.ts\`, \`semantic-tokens.ts\`, \`recipes.ts\`, \`slot-recipes.ts\`, \`global-css.ts\`, \`presets.ts\` (\`activePreset\`), \`brand-palette.ts\`
- \`brand\` is the default \`colorPalette\` (set on \`html\`), so buttons, badges and focus rings follow the theme preset automatically
- Customize components by editing recipes in \`src/theme/recipes.ts\` / \`slot-recipes.ts\` — not by repeating style props everywhere
- Snippets from \`npx @chakra-ui/cli snippet add <name>\` go in \`src/shared/components/ui/\` (pass \`--outdir\`)

### Example: HowItWorks Section (Correct Way)

\`\`\`tsx
import { Box, Center, Container, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { howItWorksSteps } from '../data'

export function HowItWorks() {
  return (
    <Box as="section" py={{ base: 16, md: 24 }}>
      <Container maxW="6xl">
        <Stack gap="3" align="center" textAlign="center" mb="12">
          <Heading as="h2" size="3xl">How it works</Heading>
          <Text color="fg.muted">Book your stay in three simple steps</Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap="8" maxW="4xl" mx="auto">
          {howItWorksSteps.map((item) => (
            <Stack key={item.step} align="center" textAlign="center" gap="4">
              <Center boxSize="14" borderRadius="full" bg="colorPalette.solid" color="colorPalette.contrast">
                <item.icon size={24} />
              </Center>
              <Stack gap="1.5">
                <Text textStyle="lg" fontWeight="semibold">{item.title}</Text>
                <Text textStyle="sm" color="fg.muted" maxW="xs">
                  {item.description}
                </Text>
              </Stack>
            </Stack>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}
\`\`\`

### Example: Resource List Page (Correct Way)

\`\`\`tsx
import { useState } from 'react'
import {
  Badge, Button, Card, Dialog, IconButton, Menu, Portal, Skeleton, Stack, Table,
} from '@chakra-ui/react'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/shared/components/page-header'

function ResourceListPage({ resources, isLoading, onDelete }) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <Stack gap="3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} h="12" />
        ))}
      </Stack>
    )
  }

  return (
    <Stack gap="8">
      <PageHeader
        title="Resources"
        actions={
          <Button asChild>
            <Link to="/resources/new"><Plus /> Create</Link>
          </Button>
        }
      />

      <Card.Root variant="outline">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Title</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader w="12" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {resources.map((r) => (
              <Table.Row key={r.id}>
                <Table.Cell>{r.title}</Table.Cell>
                <Table.Cell><Badge variant="outline">{r.status}</Badge></Table.Cell>
                <Table.Cell>
                  <Menu.Root positioning={{ placement: 'bottom-end' }}>
                    <Menu.Trigger asChild>
                      <IconButton aria-label="Actions" variant="ghost" size="sm">
                        <MoreHorizontal />
                      </IconButton>
                    </Menu.Trigger>
                    <Portal>
                      <Menu.Positioner>
                        <Menu.Content>
                          <Menu.Item value="edit" asChild>
                            <Link to={\`/resources/\${r.id}/edit\`}><Pencil size={16} /> Edit</Link>
                          </Menu.Item>
                          <Menu.Separator />
                          <Menu.Item value="delete" color="fg.error" onClick={() => setDeleteId(r.id)}>
                            <Trash2 size={16} /> Delete
                          </Menu.Item>
                        </Menu.Content>
                      </Menu.Positioner>
                    </Portal>
                  </Menu.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card.Root>

      <Dialog.Root role="alertdialog" open={!!deleteId} onOpenChange={(e) => !e.open && setDeleteId(null)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Delete resource</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>Are you sure? This cannot be undone.</Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button colorPalette="red" onClick={() => { onDelete(deleteId); setDeleteId(null) }}>
                  Delete
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Stack>
  )
}
\`\`\`
`
  },
}
