import type { Skill, SkillContext } from './types.js'

export const blacksmithHooksSkill: Skill = {
  id: 'blacksmith-hooks',
  name: 'Custom Hooks & Chakra UI Hooks',
  description: 'Custom React hooks (local implementations) and Chakra UI built-in hooks for state, UI, layout, and responsiveness.',

  render(_ctx: SkillContext): string {
    return `## Custom Hooks & Chakra UI Hooks

A combination of local custom hooks and Chakra UI built-in hooks for common UI patterns.

> **RULE: Use Chakra UI hooks when available, and local custom hooks for additional utilities.**
> Before creating a new hook, check if one already exists below.

### Chakra UI Built-in Hooks

\`\`\`tsx
import { useColorMode, useDisclosure, useBreakpointValue, useMediaQuery, useToast } from '@chakra-ui/react'
\`\`\`

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
| \`useControllable\` | Controlled/uncontrolled component pattern helper |
| \`useMergeRefs\` | Merge multiple refs into one |
| \`useTheme\` | Access the current Chakra UI theme object |

### Custom Local Hooks

These are implemented locally in the project (e.g., in \`frontend/src/shared/hooks/\`):

\`\`\`tsx
import { useDebounce } from '@/shared/hooks/use-debounce'
import { useLocalStorage } from '@/shared/hooks/use-local-storage'
\`\`\`

| Hook | Description |
|------|-------------|
| \`useDebounce\` | Debounce a value with configurable delay |
| \`useDebouncedCallback\` | Debounce a callback function |
| \`useLocalStorage\` | Persist state to localStorage with JSON serialization |
| \`useSessionStorage\` | Persist state to sessionStorage with JSON serialization |
| \`usePrevious\` | Track the previous value of a variable |
| \`useInterval\` | setInterval wrapper with pause support |
| \`useTimeout\` | setTimeout wrapper with manual clear |
| \`useEventListener\` | Attach event listeners to window or elements |
| \`useElementSize\` | Track element width/height via ResizeObserver |
| \`useHover\` | Track mouse hover state |
| \`useKeyPress\` | Listen for a specific key press |
| \`useScrollPosition\` | Track window scroll position |
| \`useScrollLock\` | Lock/unlock body scroll |
| \`useOnline\` | Track network connectivity |
| \`useWindowSize\` | Track window dimensions |
| \`usePageVisibility\` | Detect page visibility state |
| \`useIsMounted\` | Check if component is currently mounted |
| \`useIsFirstRender\` | Check if this is the first render |
| \`useUpdateEffect\` | useEffect that skips the initial render |
| \`useIntersectionObserver\` | Observe element intersection with viewport |
| \`useInfiniteScroll\` | Infinite scroll with threshold detection |

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

**Debounced search (custom hook):**
\`\`\`tsx
import { useDebounce } from '@/shared/hooks/use-debounce'
import { Input } from '@chakra-ui/react'

function SearchPage({ items }) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  // Use debouncedQuery for API calls or filtering

  return (
    <Input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  )
}
\`\`\`

**Responsive layout with Chakra hook:**
\`\`\`tsx
import { useBreakpointValue } from '@chakra-ui/react'

function Layout({ children }) {
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 })
  const isMobile = useBreakpointValue({ base: true, md: false })

  return isMobile ? <MobileLayout>{children}</MobileLayout> : <DesktopLayout>{children}</DesktopLayout>
}
\`\`\`

**Color mode toggle:**
\`\`\`tsx
import { useColorMode, useColorModeValue, IconButton } from '@chakra-ui/react'
import { Sun, Moon } from 'lucide-react'

function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode()
  const icon = colorMode === 'light' ? <Moon size={16} /> : <Sun size={16} />

  return <IconButton aria-label="Toggle color mode" icon={icon} onClick={toggleColorMode} variant="ghost" />
}
\`\`\`

**Persisted state with local storage:**
\`\`\`tsx
import { useLocalStorage } from '@/shared/hooks/use-local-storage'

function Editor() {
  const [saved, setSaved] = useLocalStorage('draft', '')
  // saved persists across page refreshes
}
\`\`\`
`
  },
}
