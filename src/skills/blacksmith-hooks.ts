import type { Skill, SkillContext } from './types.js'

export const blacksmithHooksSkill: Skill = {
  id: 'blacksmith-hooks',
  name: 'Custom Hooks & Chakra UI Hooks',
  description: 'Custom React hooks (scaffolded implementations) and Chakra UI built-in hooks for state, UI, layout, and responsiveness.',

  render(_ctx: SkillContext): string {
    return `## Custom Hooks & Chakra UI Hooks

> **RULE: Use Chakra UI hooks when available, and project custom hooks for additional utilities.**
> Before creating a new hook, check if one already exists in \`src/shared/hooks/\` or in Chakra UI.

### Chakra UI Built-in Hooks

These are always available from \`@chakra-ui/react\`:

| Hook | Description |
|------|-------------|
| \`useColorMode\` | Color mode toggle. Returns \`{ colorMode, toggleColorMode, setColorMode }\` |
| \`useColorModeValue\` | Returns a value based on current color mode: \`useColorModeValue(lightValue, darkValue)\` |
| \`useDisclosure\` | Open/close/toggle state for modals, drawers, popovers. Returns \`{ isOpen, onOpen, onClose, onToggle }\` |
| \`useBreakpointValue\` | Responsive values: \`useBreakpointValue({ base: 1, md: 2, lg: 3 })\` |
| \`useMediaQuery\` | CSS media query matching: \`useMediaQuery('(min-width: 768px)')\` |
| \`useToast\` | Programmatic toast notifications |
| \`useClipboard\` | Copy text to clipboard with status feedback |
| \`useBoolean\` | Boolean state with \`on\`, \`off\`, \`toggle\` actions |
| \`useOutsideClick\` | Detect clicks outside a ref element |
| \`useMergeRefs\` | Merge multiple refs into one |
| \`useTheme\` | Access the current Chakra UI theme object |

### Scaffolded Project Hooks

These hooks are scaffolded by Blacksmith and live in \`src/shared/hooks/\`. Check the directory to see which ones are available in your project:

| Hook | File | Description |
|------|------|-------------|
| \`useDebounce\` | \`use-debounce.ts\` | Debounce a value with configurable delay |
| \`useApiQuery\` | \`use-api-query.ts\` | Wrapper around \`useQuery\` with DRF error parsing and smart retry |
| \`useApiMutation\` | \`use-api-mutation.ts\` | Wrapper around \`useMutation\` with DRF error parsing and cache invalidation |

> **Note:** Additional hooks (e.g. \`useLocalStorage\`, \`usePrevious\`, \`useInterval\`) can be created as needed in \`src/shared/hooks/\`. Always check if one exists before writing a new one.

### Common Patterns

**Modal with Chakra disclosure:**
\`\`\`tsx
import { useDisclosure } from '@chakra-ui/react'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button } from '@chakra-ui/react'

function MyComponent() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button onClick={onOpen}>Open</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Modal content here</ModalBody>
        </ModalContent>
      </Modal>
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
  return <SimpleGrid columns={columns} spacing={6}>{children}</SimpleGrid>
}
\`\`\`
`
  },
}
