import type { Skill, SkillContext } from './types.js'
import { backendProfile } from './backend-profiles.js'

export const programmingParadigmsSkill: Skill = {
  id: 'programming-paradigms',
  name: 'Programming Paradigms',
  description: 'Functional programming for React frontend development, and the paradigm the backend framework calls for.',

  render(ctx: SkillContext): string {
    const backend = backendProfile(ctx)

    return `## Programming Paradigms

> **Frontend (React/TypeScript): Functional programming.** Pure functions, immutability, composition, declarative UI.
> ${backend.paradigmSummary}

---

## Frontend — Functional Programming

React is a functional framework. Write it functionally. No classes, no imperative mutation, no object-oriented patterns.

### Core Rules

1. **Functions, not classes** — Every component is a function. Every hook is a function. Every utility is a function. Never use \`class\` in frontend code.
2. **Pure by default** — A component given the same props should render the same output. A utility given the same arguments should return the same result. Side effects belong in hooks (\`useEffect\`, \`useMutation\`), never in render logic.
3. **Immutable data** — Never mutate state, props, or variables. Always return new values.
4. **Declarative over imperative** — Describe *what* to render, not *how* to render it. Use \`map\`, \`filter\`, ternaries, and composition — not \`for\` loops, \`if/else\` chains, or DOM manipulation.
5. **Composition over inheritance** — Build complex behavior by composing small functions and components, not by extending base classes.

### Immutability

\`\`\`tsx
// BAD — mutation
const handleAdd = (item) => {
  items.push(item)                    // mutates array
  setItems(items)                     // React won't re-render (same reference)
}

user.name = 'New Name'                // mutates object
setUser(user)

// GOOD — immutable updates
const handleAdd = (item) => {
  setItems((prev) => [...prev, item])
}

setUser((prev) => ({ ...prev, name: 'New Name' }))

// GOOD — immutable array operations
const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id))
const updateItem = (id, data) => setItems((prev) =>
  prev.map((i) => (i.id === id ? { ...i, ...data } : i))
)
\`\`\`

### Pure Functions & Composition

\`\`\`tsx
// BAD — impure, relies on external state
let taxRate = 0.1
const calculateTotal = (price) => price * (1 + taxRate)

// GOOD — pure, all inputs explicit
const calculateTotal = (price: number, taxRate: number) => price * (1 + taxRate)

// GOOD — compose small functions
const formatCurrency = (amount: number) => \`$\${amount.toFixed(2)}\`
const calculateTax = (price: number, rate: number) => price * rate
const formatPriceWithTax = (price: number, rate: number) =>
  formatCurrency(price + calculateTax(price, rate))
\`\`\`

### Declarative UI Patterns

\`\`\`tsx
// BAD — imperative rendering
function UserList({ users }) {
  const items = []
  for (let i = 0; i < users.length; i++) {
    if (users[i].isActive) {
      items.push(<UserCard key={users[i].id} user={users[i]} />)
    }
  }
  return <div>{items}</div>
}

// GOOD — declarative rendering
function UserList({ users }) {
  return (
    <Stack gap={4}>
      {users
        .filter((user) => user.isActive)
        .map((user) => <UserCard key={user.id} user={user} />)
      }
    </Stack>
  )
}

// BAD — imperative conditional
function Status({ isOnline }) {
  let badge
  if (isOnline) {
    badge = <Badge>Online</Badge>
  } else {
    badge = <Badge variant="secondary">Offline</Badge>
  }
  return badge
}

// GOOD — declarative conditional
function Status({ isOnline }) {
  return isOnline
    ? <Badge>Online</Badge>
    : <Badge variant="secondary">Offline</Badge>
}
\`\`\`

### Hooks as Functional Composition

\`\`\`tsx
// BAD — logic in component body
function OrdersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search, 300)
  const { data } = useApiQuery(ordersListOptions({ query: { page, search: debounced } }))
  const deleteOrder = useApiMutation(ordersDestroyMutation())

  // ... 20 lines of derived state and handlers

  return ( /* JSX */ )
}

// GOOD — compose hooks, component just renders
function OrdersPage() {
  const { orders, pagination, search, deleteOrder } = useOrdersPage()

  return (
    <Stack gap={4}>
      <OrdersToolbar search={search} />
      <OrdersTable orders={orders} onDelete={deleteOrder} />
      <Pagination {...pagination} />
    </Stack>
  )
}

// The hook composes smaller hooks
function useOrdersPage() {
  const search = useSearchFilter()
  const pagination = usePagination()
  const { data } = useOrders({ page: pagination.page, search: search.debounced })
  const deleteOrder = useDeleteOrder()

  return {
    orders: data?.results ?? [],
    pagination: { ...pagination, total: data?.count ?? 0 },
    search,
    deleteOrder: (id: string) => deleteOrder.mutate({ path: { id } }),
  }
}
\`\`\`

### Data Transformation — Functional Style

\`\`\`tsx
// BAD — imperative transformation
function getActiveUserNames(users) {
  const result = []
  for (const user of users) {
    if (user.isActive) {
      result.push(user.name.toUpperCase())
    }
  }
  return result
}

// GOOD — functional pipeline
const getActiveUserNames = (users: User[]) =>
  users
    .filter((u) => u.isActive)
    .map((u) => u.name.toUpperCase())

// GOOD — derive state without mutation
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)

const groupedByStatus = useMemo(
  () => items.reduce<Record<string, Item[]>>((acc, item) => ({
    ...acc,
    [item.status]: [...(acc[item.status] ?? []), item],
  }), {}),
  [items]
)
\`\`\`

### What to Avoid in Frontend Code

| Anti-pattern | Functional alternative |
|---|---|
| \`class MyComponent extends React.Component\` | \`function MyComponent()\` |
| \`this.state\`, \`this.setState\` | \`useState\`, \`useReducer\` |
| \`array.push()\`, \`object.key = value\` | Spread: \`[...arr, item]\`, \`{ ...obj, key: value }\` |
| \`for\` / \`while\` loops in render | \`.map()\`, \`.filter()\`, \`.reduce()\` |
| \`let\` for derived values | \`const\` + \`useMemo\` or inline computation |
| Mutable ref for state (\`useRef\` to track values) | \`useState\` or \`useReducer\` |
| HOCs (\`withAuth\`, \`withTheme\`) | Custom hooks (\`useAuth\`, \`useTheme\`) |
| Render props for logic sharing | Custom hooks |
| \`if/else\` chains for rendering | Ternaries, \`&&\`, early returns, lookup objects |
| Singleton services / global mutable state | Context + hooks, React Query for server state |

---

${backend.paradigms}
`
  },
}
