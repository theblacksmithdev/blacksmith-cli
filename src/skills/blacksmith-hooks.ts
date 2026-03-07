import type { Skill, SkillContext } from './types.js'

export const blacksmithHooksSkill: Skill = {
  id: 'blacksmith-hooks',

  render(_ctx: SkillContext): string {
    return `## @blacksmith-ui/hooks — React Hooks Library

A collection of 75 production-ready React hooks. SSR-safe, fully typed, zero dependencies, tree-shakeable.

> **RULE: Use \`@blacksmith-ui/hooks\` instead of writing custom hooks when one exists for that purpose.**
> Before creating a new hook, check if one already exists below.

\`\`\`tsx
import { useToggle, useLocalStorage, useDebounce, useClickOutside } from '@blacksmith-ui/hooks'
\`\`\`

### State & Data

| Hook | Description |
|------|-------------|
| \`useToggle\` | Boolean state with \`toggle\`, \`on\`, \`off\` actions |
| \`useDisclosure\` | Open/close/toggle state for modals, drawers, etc. |
| \`useCounter\` | Numeric counter with optional min/max clamping |
| \`useList\` | Array state with push, remove, update, insert, filter, clear |
| \`useMap\` | Map state with set, remove, clear helpers |
| \`useSet\` | Set state with add, remove, toggle, has, clear helpers |
| \`useHistoryState\` | State with undo/redo history |
| \`useDefault\` | State that falls back to a default when set to null/undefined |
| \`useQueue\` | FIFO queue data structure |
| \`useStack\` | LIFO stack data structure |
| \`useLocalStorage\` | Persist state to localStorage with JSON serialization |
| \`useSessionStorage\` | Persist state to sessionStorage with JSON serialization |
| \`useUncontrolled\` | Controlled/uncontrolled component pattern helper |

### Values & Memoization

| Hook | Description |
|------|-------------|
| \`useDebounce\` | Debounce a value with configurable delay |
| \`useDebouncedCallback\` | Debounce a callback function |
| \`useThrottle\` | Throttle a value with configurable interval |
| \`useThrottledCallback\` | Throttle a callback function |
| \`usePrevious\` | Track the previous value of a variable |
| \`useLatest\` | Ref that always points to the latest value |
| \`useConst\` | Compute a value once and return it on every render |
| \`useSyncedRef\` | Keep a ref synchronized with the latest value |

### DOM & Browser

| Hook | Description |
|------|-------------|
| \`useClickOutside\` | Detect clicks outside a ref element |
| \`useEventListener\` | Attach event listeners to window or elements |
| \`useElementSize\` | Track element width/height via ResizeObserver |
| \`useHover\` | Track mouse hover state |
| \`useKeyPress\` | Listen for a specific key press |
| \`useKeyCombo\` | Listen for key + modifier combinations |
| \`useLongPress\` | Detect long press gestures |
| \`useFullscreen\` | Manage the Fullscreen API |
| \`useTextSelection\` | Track currently selected text |
| \`useFocusWithin\` | Track whether focus is inside a container |
| \`useFocusTrap\` | Trap Tab/Shift+Tab focus within a container |
| \`useBoundingClientRect\` | Track element bounding rect via ResizeObserver |
| \`useSwipe\` | Detect touch swipe direction |
| \`useDrag\` | Track mouse drag with position and delta |
| \`useElementVisibility\` | Check if an element is in the viewport |
| \`useScrollPosition\` | Track window scroll position |
| \`useScrollLock\` | Lock/unlock body scroll |
| \`useMutationObserver\` | Observe DOM mutations |
| \`useIntersectionObserver\` | Observe element intersection with viewport |

### Timers & Lifecycle

| Hook | Description |
|------|-------------|
| \`useInterval\` | setInterval wrapper with pause support |
| \`useTimeout\` | setTimeout wrapper with manual clear |
| \`useCountdown\` | Countdown timer with start/pause/reset |
| \`useStopwatch\` | Stopwatch with lap support |
| \`useIdleTimer\` | Detect user idle time |
| \`useUpdateEffect\` | useEffect that skips the initial render |
| \`useIsomorphicLayoutEffect\` | SSR-safe useLayoutEffect |
| \`useIsMounted\` | Check if component is currently mounted |
| \`useIsFirstRender\` | Check if this is the first render |

### Async & Network

| Hook | Description |
|------|-------------|
| \`useFetch\` | Declarative data fetching with loading/error states (use for external URLs; use TanStack Query for API calls) |
| \`useAsync\` | Execute async functions with status tracking |
| \`useScript\` | Dynamically load external scripts |
| \`useWebSocket\` | WebSocket connection with auto-reconnect |
| \`useSSE\` | Server-Sent Events (EventSource) wrapper |
| \`usePolling\` | Poll an async function at a fixed interval |
| \`useAbortController\` | Manage AbortController lifecycle |
| \`useRetry\` | Retry async operations with exponential backoff |
| \`useSearch\` | Filter arrays with debounced search |

### Browser APIs

| Hook | Description |
|------|-------------|
| \`useMediaQuery\` | Reactive CSS media query matching |
| \`useDarkMode\` | Dark mode toggle (\`.dark\` class on documentElement) |
| \`useColorScheme\` | Detect system color scheme preference |
| \`useCopyToClipboard\` | Copy text to clipboard with status feedback |
| \`useOnline\` | Track network connectivity |
| \`useWindowSize\` | Track window dimensions |
| \`usePageVisibility\` | Detect page visibility state |
| \`usePageLeave\` | Detect when the user leaves the page |
| \`useFavicon\` | Dynamically change the favicon |
| \`useReducedMotion\` | Respect prefers-reduced-motion |
| \`useBreakpoint\` | Responsive breakpoint detection |
| \`useIsClient\` | SSR-safe client-side detection |

### Layout & UI

| Hook | Description |
|------|-------------|
| \`useStickyHeader\` | Detect when header should be sticky |
| \`useVirtualList\` | Virtualized list rendering for large datasets |
| \`useInfiniteScroll\` | Infinite scroll with threshold detection |
| \`useCollapse\` | Collapse/expand animation with prop getters |
| \`useSteps\` | Multi-step flow navigation |

### Common Patterns

**Modal with click-outside dismiss:**
\`\`\`tsx
import { useDisclosure, useClickOutside } from '@blacksmith-ui/hooks'

function MyComponent() {
  const [opened, { open, close }] = useDisclosure(false)
  const ref = useClickOutside<HTMLDivElement>(close)

  return (
    <>
      <Button onClick={open}>Open</Button>
      {opened && <div ref={ref}>Modal content</div>}
    </>
  )
}
\`\`\`

**Debounced search:**
\`\`\`tsx
import { useDebounce, useSearch } from '@blacksmith-ui/hooks'

function SearchPage({ items }) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const results = useSearch(items, debouncedQuery, ['title', 'description'])

  return (
    <>
      <Input value={query} onChange={(e) => setQuery(e.target.value)} />
      {results.map(item => <div key={item.id}>{item.title}</div>)}
    </>
  )
}
\`\`\`

**Persisted state with undo:**
\`\`\`tsx
import { useLocalStorage, useHistoryState } from '@blacksmith-ui/hooks'

function Editor() {
  const [saved, setSaved] = useLocalStorage('draft', '')
  const [content, { set, undo, redo, canUndo, canRedo }] = useHistoryState(saved)

  const handleSave = () => setSaved(content)
}
\`\`\`

**Responsive layout:**
\`\`\`tsx
import { useBreakpoint, useWindowSize } from '@blacksmith-ui/hooks'

function Layout({ children }) {
  const breakpoint = useBreakpoint({ sm: 640, md: 768, lg: 1024 })
  const isMobile = breakpoint === 'sm'

  return isMobile ? <MobileLayout>{children}</MobileLayout> : <DesktopLayout>{children}</DesktopLayout>
}
\`\`\`
`
  },
}
