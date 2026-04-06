import type { Skill, SkillContext } from './types.js'

export const chakraUiReactSkill: Skill = {
  id: 'chakra-ui-react',
  name: 'Chakra UI React',
  description: 'Core UI component library — Chakra UI v2 components for layout, typography, inputs, data display, overlays, feedback, media, and navigation.',

  render(_ctx: SkillContext): string {
    return `## Chakra UI React — Core UI Components

> **CRITICAL RULE: Every UI element MUST be built using \`@chakra-ui/react\` components — including layout and typography.**
> Do NOT use raw HTML elements when a Chakra UI component exists for that purpose.
> This includes layout: use \`HStack\`, \`VStack\`, \`SimpleGrid\`, \`Box\`, \`Container\` instead of \`<div>\` with flex/grid classes.
> This includes typography: use \`Heading\` and \`Text\` instead of raw \`<h1>\`–\`<h6>\`, \`<p>\`, \`<span>\`.

### Layout

| Component | Use instead of | Description |
|-----------|---------------|-------------|
| \`Box\` | \`<div>\` | Base layout primitive with style props |
| \`Flex\` / \`HStack\` | \`<div className="flex ...">\` | Flexbox container with style props (\`direction\`, \`align\`, \`justify\`, \`gap\`, \`wrap\`) |
| \`SimpleGrid\` | \`<div className="grid ...">\` | CSS Grid container (\`columns\`, \`spacing\`) |
| \`VStack\` | \`<div className="flex flex-col gap-...">\` | Vertical stack (\`spacing\`) |
| \`HStack\` | \`<div className="flex flex-row gap-...">\` | Horizontal stack (\`spacing\`) |
| \`Container\` | \`<div className="max-w-7xl mx-auto px-...">\` | Max-width centered container |
| \`Divider\` | \`<hr>\` or border hacks | Visual separator (horizontal/vertical) |
| \`AspectRatio\` | padding-bottom trick | Maintain aspect ratio for content |

### Typography

| Component | Use instead of | Description |
|-----------|---------------|-------------|
| \`Text\` | \`<p>\`, \`<span>\` | Text display with style props (\`fontSize\`, \`fontWeight\`, \`color\`, \`textAlign\`) |
| \`Heading\` | \`<h1>\`–\`<h6>\`, \`<p>\` | Semantic heading elements (\`as\`: h1–h6, \`size\`: 2xl, xl, lg, md, sm, xs) |
| \`FormLabel\` | \`<label>\` | Form label with accessibility support |

### Cards & Containers

- \`Card\`, \`CardHeader\`, \`CardBody\`, \`CardFooter\` — Use instead of styled \`<div>\` containers. Use \`Heading\` and \`Text\` inside for title/description.

### Actions

- \`Button\` — Use instead of \`<button>\` or \`<a>\` styled as buttons
  - Variants: \`solid\`, \`outline\`, \`ghost\`, \`link\`
  - Sizes: \`xs\`, \`sm\`, \`md\`, \`lg\`
  - Use \`colorScheme\` for color: \`blue\`, \`red\`, \`green\`, \`gray\`, etc.
- \`IconButton\` — Use for icon-only buttons
- \`Menu\`, \`MenuButton\`, \`MenuList\`, \`MenuItem\`, \`MenuDivider\`, \`MenuGroup\` — Use for action menus
- \`AlertDialog\`, \`AlertDialogOverlay\`, \`AlertDialogContent\`, \`AlertDialogHeader\`, \`AlertDialogBody\`, \`AlertDialogFooter\` — Use for destructive action confirmations

### Data Entry

- \`Input\` — Use instead of \`<input>\`
- \`InputGroup\`, \`InputLeftElement\`, \`InputRightElement\` — Use for input with icons/addons
- \`Textarea\` — Use instead of \`<textarea>\`
- \`NumberInput\`, \`NumberInputField\`, \`NumberInputStepper\`, \`NumberIncrementStepper\`, \`NumberDecrementStepper\` — Use for numeric inputs
- \`Select\` — Use instead of \`<select>\`
- \`Checkbox\`, \`CheckboxGroup\` — Use instead of \`<input type="checkbox">\`
- \`Radio\`, \`RadioGroup\` — Use instead of \`<input type="radio">\`
- \`Switch\` — Use for toggle switches
- \`Slider\`, \`SliderTrack\`, \`SliderFilledTrack\`, \`SliderThumb\` — Use for range inputs
- \`PinInput\`, \`PinInputField\` — Use for PIN/OTP code entry
- \`FormLabel\` — Use instead of \`<label>\`

### Data Display

- \`Table\`, \`Thead\`, \`Tbody\`, \`Tr\`, \`Th\`, \`Td\`, \`TableContainer\` — Use instead of \`<table>\` elements
- \`Badge\` — Use for status indicators, tags, counts (\`colorScheme\`: \`green\`, \`red\`, \`blue\`, \`gray\`, etc.)
- \`Avatar\` — Use for user profile images (use \`name\` prop for fallback initials)
- \`Tooltip\` — Use for hover hints (\`label\` prop for content)
- \`Stat\`, \`StatLabel\`, \`StatNumber\`, \`StatHelpText\`, \`StatArrow\` — Use for metric/stat display
- \`Skeleton\`, \`SkeletonText\`, \`SkeletonCircle\` — Use for loading placeholders
- \`Spinner\` — Use for loading indicators
- \`Progress\` — Use for progress bars
- \`Tag\`, \`TagLabel\`, \`TagCloseButton\` — Use for removable tags

### Tabs & Accordion

- \`Tabs\`, \`TabList\`, \`Tab\`, \`TabPanels\`, \`TabPanel\` — Use for tabbed interfaces
- \`Accordion\`, \`AccordionItem\`, \`AccordionButton\`, \`AccordionPanel\`, \`AccordionIcon\` — Use for collapsible sections

### Overlays

- \`Modal\`, \`ModalOverlay\`, \`ModalContent\`, \`ModalHeader\`, \`ModalBody\`, \`ModalFooter\`, \`ModalCloseButton\` — Use for modals
- \`AlertDialog\` — Use for confirmation dialogs
- \`Drawer\`, \`DrawerOverlay\`, \`DrawerContent\`, \`DrawerHeader\`, \`DrawerBody\`, \`DrawerFooter\`, \`DrawerCloseButton\` — Use for slide-out panels
- \`Popover\`, \`PopoverTrigger\`, \`PopoverContent\`, \`PopoverHeader\`, \`PopoverBody\`, \`PopoverArrow\`, \`PopoverCloseButton\` — Use for floating content panels

### Navigation

- \`Breadcrumb\`, \`BreadcrumbItem\`, \`BreadcrumbLink\` — Use for breadcrumb trails

### Feedback

- \`Alert\`, \`AlertIcon\`, \`AlertTitle\`, \`AlertDescription\` — Use for inline messages/warnings (\`status\`: \`error\`, \`warning\`, \`success\`, \`info\`)
- \`useToast\` — Use for transient notifications

### Utilities & Hooks

- \`useColorMode()\` — Color mode toggle. Returns \`{ colorMode, toggleColorMode }\`
- \`useDisclosure()\` — Open/close state for modals, drawers, etc. Returns \`{ isOpen, onOpen, onClose, onToggle }\`
- \`useBreakpointValue()\` — Responsive values based on breakpoint
- \`useToast()\` — Programmatic toast notifications
- \`useMediaQuery()\` — CSS media query matching

---

### Component-First Rules

1. **Layout**: NEVER use \`<div className="flex ...">\` or \`<div className="grid ...">\`. Use \`<Flex>\`, \`<SimpleGrid>\`, \`<VStack>\`, \`<HStack>\`, \`<Box>\` from \`@chakra-ui/react\`.
2. **Centering/max-width**: NEVER use \`<div className="max-w-7xl mx-auto px-...">\`. Use \`<Container>\`.
3. **Typography**: NEVER use raw \`<h1>\`–\`<h6>\` or \`<p>\` with Tailwind text classes. Use \`<Heading as="h2" size="lg">\` or \`<Text>\`.
4. **Separators**: NEVER use \`<hr>\` or border hacks. Use \`<Divider>\`.
5. **Buttons**: NEVER use \`<button>\` or \`<a>\` styled as a button. Use \`<Button>\`.
6. **Inputs**: NEVER use \`<input>\`, \`<textarea>\`, \`<select>\` directly. Use the Chakra UI equivalents.
7. **Cards**: NEVER use a styled \`<div>\` as a card. Use \`Card\` + sub-components.
8. **Tables**: NEVER use raw \`<table>\` HTML. Use Chakra UI \`Table\` components.
9. **Loading**: NEVER use custom \`animate-pulse\` divs. Use \`Skeleton\` or \`Spinner\`.
10. **Modals**: NEVER build custom modals. Use \`Modal\`, \`AlertDialog\`, or \`Drawer\`.
11. **Feedback**: NEVER use plain styled text for errors/warnings. Use \`Alert\` or \`useToast\`.

### When Raw HTML IS Acceptable

- \`<main>\`, \`<section>\`, \`<header>\`, \`<footer>\`, \`<nav>\`, \`<article>\`, \`<aside>\` — semantic HTML landmarks for page structure (but use \`Flex\`/\`VStack\`/\`SimpleGrid\` inside them for layout)
- \`<Link>\` from react-router-dom — for page navigation (wrap with \`<Button as={Link}>...\` if it needs button styling)
- Icon components from \`lucide-react\`
- \`<form>\` element when used with React Hook Form (but use Chakra UI form components inside)

### Design Tokens & Theming

- \`ChakraProvider\` — Wrap app with \`theme\` prop to apply preset or custom theme
- Extend theme with \`extendTheme()\` from \`@chakra-ui/react\`
- All components use design tokens from the theme
- Color mode: \`useColorMode()\` hook, or \`ColorModeScript\` in document head
- Extend with \`sx\` prop or \`style props\` for custom styles

### Example: HowItWorks Section (Correct Way)

\`\`\`tsx
import { Container, VStack, Flex, SimpleGrid, Text, Heading, Box } from '@chakra-ui/react'
import { howItWorksSteps } from '../data'

export function HowItWorks() {
  return (
    <Box as="section" py={{ base: 16, sm: 20 }}>
      <Container maxW="container.xl">
        <VStack spacing={3} align="center" mb={12}>
          <Heading as="h2" size="xl">How It Works</Heading>
          <Text color="gray.500">Book your stay in three simple steps</Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} maxW="4xl" mx="auto">
          {howItWorksSteps.map((item) => (
            <VStack key={item.step} align="center" spacing={4}>
              <Box position="relative">
                <Flex align="center" justify="center" h={16} w={16} rounded="full" bg="blue.500" color="white" shadow="lg">
                  <item.icon size={28} />
                </Flex>
                <Flex align="center" justify="center" position="absolute" top={-1} right={-1} h={6} w={6} rounded="full" bg="white" borderWidth={2} borderColor="blue.500">
                  <Text fontSize="xs" fontWeight="bold" color="blue.500">{item.step}</Text>
                </Flex>
              </Box>
              <VStack spacing={2} align="center">
                <Text fontSize="lg" fontWeight="bold">{item.title}</Text>
                <Text fontSize="sm" color="gray.500" textAlign="center" maxW="xs">
                  {item.description}
                </Text>
              </VStack>
            </VStack>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}
\`\`\`

### Example: Resource List Page (Correct Way)

\`\`\`tsx
import {
  VStack, Flex, Box,
  Card, CardHeader, CardBody,
  Button, Badge, Skeleton, Heading,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider,
  AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  IconButton, useDisclosure,
} from '@chakra-ui/react'
import { MoreHorizontal, Plus, Trash2, Edit } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRef } from 'react'

function ResourceListPage({ resources, isLoading, onDelete }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()
  const [deleteId, setDeleteId] = useState(null)

  if (isLoading) {
    return (
      <Card>
        <CardBody p={6}>
          <VStack spacing={4}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} h="48px" w="full" />
            ))}
          </VStack>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <Flex align="center" justify="space-between">
          <Heading size="md">Resources</Heading>
          <Button as={Link} to="/resources/new" leftIcon={<Plus size={16} />} colorScheme="blue">
            Create
          </Button>
        </Flex>
      </CardHeader>
      <CardBody>
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Status</Th>
                <Th w="48px" />
              </Tr>
            </Thead>
            <Tbody>
              {resources.map((r) => (
                <Tr key={r.id}>
                  <Td>{r.title}</Td>
                  <Td><Badge variant="outline">{r.status}</Badge></Td>
                  <Td>
                    <Menu>
                      <MenuButton as={IconButton} icon={<MoreHorizontal size={16} />} variant="ghost" size="sm" />
                      <MenuList>
                        <MenuItem as={Link} to={\`/resources/\${r.id}/edit\`} icon={<Edit size={16} />}>
                          Edit
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem icon={<Trash2 size={16} />} color="red.500" onClick={() => { setDeleteId(r.id); onOpen() }}>
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Resource</AlertDialogHeader>
            <AlertDialogBody>Are you sure? This cannot be undone.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>Cancel</Button>
              <Button colorScheme="red" onClick={() => { onDelete(deleteId); onClose() }} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Card>
  )
}
\`\`\`
`
  },
}
