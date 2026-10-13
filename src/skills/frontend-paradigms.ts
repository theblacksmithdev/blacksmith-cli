/**
 * The frontend half of the programming-paradigms skill, per framework. Both
 * frontends are functional, but each expresses it in its own idiom.
 */

export const REACT_PARADIGMS = `## Frontend — Functional Programming

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
`

export const VUE_PARADIGMS = `## Frontend — Functional Programming

Vue's Composition API is functional: components are \`<script setup>\` functions of their props, and logic is composed from composables. Write it functionally. No classes, no Options API, no mutation of anything you do not own.

### Core Rules

1. **Functions, not classes** — Every composable is a function. Every utility is a function. Never use \`class\` or the Options API (\`data()\`, \`methods\`, \`this\`) in frontend code.
2. **Pure by default** — A component given the same props renders the same output. A utility given the same arguments returns the same result. Side effects belong in composables (\`watch\`, \`useApiMutation\`) and event handlers, never in \`computed\` or the template.
3. **Own your state, never someone else's** — Never mutate props or a store's state from outside its actions. A component changes its own \`ref\`s; a parent's data changes through an emitted event or \`defineModel\`.
4. **Derive, don't sync** — Compute values from state with \`computed\`, instead of copying them into another \`ref\` and keeping the copy in step with a \`watch\`.
5. **Composition over inheritance** — Build behaviour by composing small composables and components, never by extending base components or mixins.

### Reactivity and Immutability

\`\`\`ts
// BAD — mutating a prop (Vue warns, and the parent never knows)
const props = defineProps<{ items: Item[] }>()
props.items.push(item)

// GOOD — the owner changes its own state; children emit
const emit = defineEmits<{ add: [item: Item] }>()
emit('add', item)

// GOOD — replace rather than mutate shared arrays, so watchers and computeds see a new value
const items = ref<Item[]>([])
items.value = [...items.value, item]
items.value = items.value.filter((i) => i.id !== id)

// BAD — copying derived data into state and syncing it by hand
const total = ref(0)
watch(items, () => { total.value = items.value.length })

// GOOD — derive it
const total = computed(() => items.value.length)
\`\`\`

Destructuring loses reactivity: \`const { title } = reactive(state)\` is a plain value. Keep the object (\`state.title\`), use \`toRefs\`, or \`storeToRefs(store)\` for a Pinia store. Props destructured in \`<script setup>\` stay reactive on Vue 3.5, but only in the template and in \`computed\`/\`watch\` getters.

### Pure Functions & Composition

\`\`\`ts
// BAD — impure, relies on external state
let taxRate = 0.1
const calculateTotal = (price: number) => price * (1 + taxRate)

// GOOD — pure, all inputs explicit, lives in utils/
export const calculateTotal = (price: number, taxRate: number) => price * (1 + taxRate)
\`\`\`

### Declarative Templates

\`\`\`vue
<!-- BAD — building a list imperatively in script -->
<script setup lang="ts">
const cards: VNode[] = []
for (const user of props.users) if (user.isActive) cards.push(h(UserCard, { user }))
</script>

<!-- GOOD — filter in a computed, render with v-for -->
<script setup lang="ts">
const activeUsers = computed(() => props.users.filter((user) => user.isActive))
</script>

<template>
  <UserCard v-for="user in activeUsers" :key="user.id" :user="user" />
</template>
\`\`\`

Never combine \`v-if\` and \`v-for\` on one element: filter in a \`computed\` instead.

### Composables as Functional Composition

\`\`\`ts
// BAD — a page whose script does everything
const page = ref(1)
const search = ref('')
const debounced = refDebounced(search, 300)
const { data } = useApiQuery(() => ordersListOptions({ query: { page: page.value, search: debounced.value } }))
// ... 20 lines of derived state and handlers

// GOOD — the page calls one composable and renders
const { orders, page, total, search } = useOrdersPage()

// pages/orders/composables/use-orders-page.ts — composes smaller pieces
export function useOrdersPage() {
  const page = ref(1)
  const search = ref('')
  const debouncedSearch = refDebounced(search, 300)
  const { data } = useOrders(() => ({ page: page.value, search: debouncedSearch.value }))

  return {
    orders: computed(() => data.value?.orders ?? []),
    total: computed(() => data.value?.total ?? 0),
    page,
    search,
  }
}
\`\`\`

A composable returns refs and functions, never a \`reactive()\` object, so callers can destructure it.

### What to Avoid in Frontend Code

| Anti-pattern | Functional alternative |
|---|---|
| Options API (\`data()\`, \`methods\`, \`this\`) | \`<script setup>\` with \`ref\`, \`computed\`, functions |
| Mixins and extended base components | Composables |
| Mutating props or store state directly | Emit an event, \`defineModel\`, or a store action |
| \`watch\` that copies one value into another \`ref\` | \`computed\` |
| \`for\` loops building markup | \`computed\` + \`v-for\` |
| \`v-if\` and \`v-for\` on the same element | Filter in a \`computed\` |
| A composable returning \`reactive()\` | Return refs, so destructuring keeps reactivity |
| Global mutable singletons | A Pinia store for client state, Vue Query for server state |
`
