/**
 * The backend half of the programming-paradigms skill, per framework. Each
 * framework has its own idiom, so each gets its own section rather than one
 * written for Django and shipped to all three.
 */

export const DJANGO_PARADIGMS = `## Backend — OOP with Functional Patterns

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
| Deep inheritance chains | Prefer composition, keep inheritance to 1-2 levels |`

export const EXPRESS_PARADIGMS = `## Backend — Functional Modules

The Express backend has no classes of its own. A module is a set of plain
functions: the service holds the logic, the controller adapts HTTP, and data
flows through them as plain objects typed by Zod.

### Rules

- **Services are module-level functions**, not classes. Pass the user and the
  input in; return plain data out. No hidden state, so any function can be
  called from a route, a script or a test
- **Transform data with \`map\`/\`filter\`/\`reduce\` and spread**, never by
  mutating the object Prisma returned
- **Serialize at the edge.** A \`serializeX(record)\` function turns a Prisma row
  into the response shape, once, in the service
- **Throw \`ApiError\`** for failures; never return \`null\` to mean "not found"
- **Classes only where a library expects one** (e.g. extending \`Error\`)

### Anti-Patterns

| Anti-pattern | Correct approach |
|---|---|
| \`class PostService\` with one instance per request | Module-level functions taking the user |
| Business logic in a controller | Move it to the service |
| Mutating a Prisma result before returning it | Build a new object in the serializer |
| \`let\` accumulators in loops | \`map\`, \`filter\`, \`reduce\` |
`

export const FASTAPI_PARADIGMS = `## Backend — Functions and Dependency Injection

FastAPI is function-first. Endpoints are functions, dependencies are
functions, and classes are kept for what is genuinely data: SQLAlchemy models
and Pydantic schemas.

### Rules

- **Services are module-level functions** taking the session and the user:
  \`list_posts(db, user, page, search, ordering)\`. No service classes holding a
  session, so each function is easy to call from a router, a script or a test
- **Dependencies come from \`Depends\`**, never from globals: \`get_db\` for the
  session, \`get_current_user\` for the user
- **Data crosses layers as Pydantic models.** Routers receive request schemas
  and return response schemas; the service's \`serialize()\` builds them from
  rows, once
- **Pure functions for transforms.** Comprehensions and small functions,
  never mutating a row you are not saving
- **Raise \`HTTPException\`** for failures; never return \`None\` to mean "not found"
- **Type hints everywhere**; they are what FastAPI validates and documents

### Anti-Patterns

| Anti-pattern | Correct approach |
|---|---|
| \`class PostService\` holding a session | Functions that take \`db\` as an argument |
| Queries in the router | Move them to the service |
| A module-level session or engine use in a router | \`db: Session = Depends(get_db)\` |
| Returning ORM rows and relying on \`from_attributes\` everywhere | One \`serialize()\` per resource |
| Mutable default arguments (\`def f(items=[])\`) | \`None\` default, then \`items = items or []\` |
`
