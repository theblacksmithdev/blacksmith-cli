import type { Skill, SkillContext } from './types.js'

export const programmingParadigmsSkill: Skill = {
  id: 'programming-paradigms',
  name: 'Programming Paradigms',
  description: 'Functional programming for React frontend development, OOP + functional patterns for Django backend development.',

  render(_ctx: SkillContext): string {
    return `## Programming Paradigms

> **Frontend (React/TypeScript): Functional programming.** Pure functions, immutability, composition, declarative UI.
> **Backend (Django/Python): OOP with functional touches.** Classes for structure, pure functions for logic, no mutation where avoidable.

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
    deleteOrder: (id: number) => deleteOrder.mutate({ path: { id } }),
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

## Backend — OOP with Functional Patterns

Django is object-oriented by design. Lean into it for structure (models, views, serializers, services), but use functional patterns for pure logic and data transformations.

### OOP for Structure

**Models** — Encapsulate data and behavior together:
\`\`\`python
class Order(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.pk} — {self.user}"

    @property
    def is_cancellable(self):
        return self.status in ('pending', 'confirmed')

    def recalculate_total(self):
        self.total = self.items.aggregate(
            total=Sum(F('quantity') * F('unit_price'))
        )['total'] or 0
        self.save(update_fields=['total'])
\`\`\`

**Services** — Classes for complex business operations with multiple related methods:
\`\`\`python
class OrderService:
    @staticmethod
    @transaction.atomic
    def place_order(*, user, items, shipping_address):
        order = Order.objects.create(user=user, shipping_address=shipping_address)
        for item_data in items:
            OrderItem.objects.create(order=order, **item_data)
        order.recalculate_total()
        NotificationService.send_order_confirmation(order=order)
        return order

    @staticmethod
    @transaction.atomic
    def cancel_order(*, order, user):
        if not order.is_cancellable:
            raise ValidationError("Order cannot be cancelled in its current state.")
        if order.user != user:
            raise PermissionDenied("You can only cancel your own orders.")
        order.status = 'cancelled'
        order.save(update_fields=['status'])
        InventoryService.restore_stock(order=order)
        return order
\`\`\`

**ViewSets** — Inherit, extend, override:
\`\`\`python
class OrderViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return OrderSelector.list_for_user(user=self.request.user)

    def get_serializer_class(self):
        return {
            'list': OrderListSerializer,
            'retrieve': OrderDetailSerializer,
            'create': OrderCreateSerializer,
        }.get(self.action, OrderUpdateSerializer)

    def perform_create(self, serializer):
        serializer.save()
\`\`\`

**Custom permissions, filters, pagination** — All class-based, inheriting from DRF base classes:
\`\`\`python
class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class OrderFilterSet(django_filters.FilterSet):
    class Meta:
        model = Order
        fields = ['status', 'created_at']
\`\`\`

### Functional Patterns in Python

Use functional style for pure logic, data transformation, and utilities — anywhere you don't need state or inheritance.

**Selectors** — Pure query builders (can be functions or static methods):
\`\`\`python
# selectors.py — pure functions that build querysets
def get_active_orders(*, user, status=None):
    qs = (
        Order.objects
        .filter(user=user, is_active=True)
        .select_related('user')
        .prefetch_related('items__product')
    )
    if status:
        qs = qs.filter(status=status)
    return qs.order_by('-created_at')

def get_order_summary(*, user):
    return (
        Order.objects
        .filter(user=user)
        .values('status')
        .annotate(count=Count('id'), total=Sum('total'))
    )
\`\`\`

**Data transformations** — Use comprehensions, \`map\`, pure functions:
\`\`\`python
# BAD — imperative mutation
def format_export_data(orders):
    result = []
    for order in orders:
        row = {}
        row['id'] = order.id
        row['total'] = str(order.total)
        row['items'] = ', '.join([i.product.name for i in order.items.all()])
        result.append(row)
    return result

# GOOD — functional transformation
def format_export_data(orders):
    return [
        {
            'id': order.id,
            'total': str(order.total),
            'items': ', '.join(i.product.name for i in order.items.all()),
        }
        for order in orders
    ]
\`\`\`

**Utility functions** — Pure, no side effects:
\`\`\`python
# utils.py — all pure functions
def calculate_discount(price: Decimal, percentage: int) -> Decimal:
    return price * (Decimal(percentage) / 100)

def slugify_unique(name: str, existing_slugs: set[str]) -> str:
    base = slugify(name)
    slug = base
    counter = 1
    while slug in existing_slugs:
        slug = f"{base}-{counter}"
        counter += 1
    return slug

def paginate_list(items: list, page: int, page_size: int = 20) -> list:
    start = (page - 1) * page_size
    return items[start:start + page_size]
\`\`\`

**Decorators** — Functional composition for cross-cutting concerns:
\`\`\`python
import functools
import logging

logger = logging.getLogger(__name__)

def log_service_call(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logger.info(f"Calling {func.__name__} with kwargs={kwargs}")
        result = func(*args, **kwargs)
        logger.info(f"{func.__name__} completed successfully")
        return result
    return wrapper

# Usage
class OrderService:
    @staticmethod
    @log_service_call
    @transaction.atomic
    def place_order(*, user, items, shipping_address):
        ...
\`\`\`

### When to Use What

| Pattern | Use OOP (class) | Use Functional (function) |
|---------|-----------------|---------------------------|
| **Models** | Always — Django models are classes | Model methods can be property-style pure computations |
| **Views** | Always — ViewSets, APIViews | — |
| **Serializers** | Always — DRF serializers are classes | — |
| **Services** | Business logic with multiple related operations | Single-purpose operations can be standalone functions |
| **Selectors** | Either — class with static methods or module-level functions | Preferred — pure functions that return querysets |
| **Permissions** | Always — DRF permissions are class-based | — |
| **Filters** | Always — django-filter uses classes | — |
| **Utilities** | Never — don't wrap utilities in classes | Always — pure functions |
| **Data transforms** | Never | Always — comprehensions, map, pure functions |
| **Validators** | DRF validator classes for reusable validation | Simple validation functions for one-off checks |
| **Signals** | Receiver functions (decorated functions) | — |
| **Tests** | Test classes inheriting APITestCase | Individual test functions with pytest are also fine |

### Backend Anti-Patterns

| Anti-pattern | Correct approach |
|---|---|
| God class with 20+ methods | Split into focused Service + Selector + utils |
| Utility class with only static methods | Use module-level functions instead |
| Mixin soup (\`class View(A, B, C, D, E)\`) | Compose with max 1-2 mixins, prefer explicit overrides |
| Business logic in views | Move to services |
| Business logic in serializers | Serializers validate, services execute |
| Mutable default arguments (\`def f(items=[])\`) | Use \`None\` default: \`def f(items=None)\` → \`items = items or []\` |
| Nested \`for\` loops for data building | List/dict comprehensions |
| Raw SQL for simple queries | Django ORM with \`annotate\`, \`Subquery\`, \`F\` expressions |
| Global mutable state | Pass dependencies explicitly, use Django settings for config |
| Deep inheritance chains | Prefer composition, keep inheritance to 1-2 levels |
`
  },
}
