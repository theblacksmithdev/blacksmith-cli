import type { Skill, SkillContext } from './types.js'

export const blacksmithHooksSkill: Skill = {
  id: 'blacksmith-hooks',
  name: 'Custom Hooks & Chakra UI Hooks',
  description: 'Custom React hooks (scaffolded implementations) and Chakra UI v3 built-in hooks for state, UI, layout, and responsiveness.',

  render(_ctx: SkillContext): string {
    return `## Custom Hooks & Chakra UI Hooks

> **RULE: Use Chakra UI hooks when available, and project custom hooks for additional utilities.**
> Before creating a new hook, check if one already exists in \`src/shared/hooks/\` or in Chakra UI.

### Chakra UI Built-in Hooks

These are always available from \`@chakra-ui/react\`:

| Hook | Description |
|------|-------------|
| \`useDisclosure\` | Open/close/toggle state for dialogs, drawers, popovers. Returns \`{ open, onOpen, onClose, onToggle }\` (v3 — NOT \`isOpen\`) |
| \`useBreakpointValue\` | Responsive values: \`useBreakpointValue({ base: 1, md: 2, lg: 3 })\` |
| \`useMediaQuery\` | CSS media query matching: \`useMediaQuery(['(min-width: 768px)'])\` |
| \`useClipboard\` | Copy text to clipboard (\`{ copy, copied }\`) |
| \`useControllableState\` | State that can be controlled or uncontrolled |
| \`useCallbackRef\` | Stable callback reference |

> v2 hooks \`useColorMode\`, \`useColorModeValue\`, \`useToast\`, \`useBoolean\` and \`useTheme\` are gone in v3. Use the project's \`useColorMode\` (below), the toaster snippet (\`toaster.create(...)\`), and semantic tokens (\`fg.muted\`, \`bg.subtle\`) that adapt to color mode automatically.

### Scaffolded Project Hooks

These hooks are scaffolded by Blacksmith and live in \`src/shared/hooks/\`. Check the directory to see which ones are available in your project:

| Hook | File | Description |
|------|------|-------------|
| \`useColorMode\` | \`use-color-mode.ts\` | \`{ colorMode, setColorMode, toggleColorMode }\` — follows the OS until the user picks a mode (store in \`src/shared/utils/color-mode.ts\`) |
| \`useDebounce\` | \`use-debounce.ts\` | Debounce a value with configurable delay |
| \`useApiQuery\` | \`use-api-query.ts\` | Wrapper around \`useQuery\` with DRF error parsing and smart retry |
| \`useApiMutation\` | \`use-api-mutation.ts\` | Wrapper around \`useMutation\` with DRF error parsing and cache invalidation |

> **Note:** Additional hooks (e.g. \`useLocalStorage\`, \`usePrevious\`, \`useInterval\`) can be created as needed in \`src/shared/hooks/\`. Always check if one exists before writing a new one.

### Common Patterns

**Dialog with Chakra disclosure:**
\`\`\`tsx
import { Button, Dialog, Portal, useDisclosure } from '@chakra-ui/react'

function MyComponent() {
  const { open, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button onClick={onOpen}>Open</Button>
      <Dialog.Root open={open} onOpenChange={(e) => (e.open ? onOpen() : onClose())}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Dialog title</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>Dialog content here</Dialog.Body>
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}
\`\`\`

**Debounced search:**
\`\`\`tsx
import { useDebounce } from '@/shared/hooks/use-debounce'
import { Input } from '@chakra-ui/react'

function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => { onSearch(debouncedQuery) }, [debouncedQuery, onSearch])

  return <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." />
}
\`\`\`

**Responsive layout:**
\`\`\`tsx
import { useBreakpointValue } from '@chakra-ui/react'

function Layout({ children }) {
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 })
  return <SimpleGrid columns={columns} gap="6">{children}</SimpleGrid>
}
\`\`\`
`
  },
}
