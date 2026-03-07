import type { Skill, SkillContext } from './types.js'

export const djangoRestAdvancedSkill: Skill = {
  id: 'django-rest-advanced',
  filename: 'django-rest-advanced.md',

  render(_ctx: SkillContext): string {
    return `## Advanced Django REST Framework — Senior-Level Patterns

> **RULE: Follow these patterns for production-grade, scalable, and maintainable DRF APIs.**
> These build on top of the base Django conventions. Apply them when building non-trivial features.

### Architecture: Service Layer Pattern

Keep views and serializers thin. Extract business logic into service modules.

\`\`\`
backend/apps/<app>/
├── models.py          # Data + model-level methods only
├── serializers.py     # Validation + representation only
├── views.py           # HTTP glue + permissions only
├── services.py        # Business logic lives here
├── selectors.py       # Complex read queries
├── permissions.py     # Custom permission classes
├── filters.py         # Custom filter backends
├── signals.py         # Signal handlers (use sparingly)
├── tasks.py           # Celery/background tasks
└── tests/
    ├── test_views.py
    ├── test_services.py
    └── test_selectors.py
\`\`\`

\`\`\`python
# services.py — Business logic
from django.db import transaction

class OrderService:
    @staticmethod
    @transaction.atomic
    def place_order(*, user, items, shipping_address):
        """Place an order with inventory validation and payment."""
        order = Order.objects.create(user=user, shipping_address=shipping_address)
        for item in items:
            if item['product'].stock < item['quantity']:
                raise ValidationError(f"Insufficient stock for {item['product'].name}")
            OrderItem.objects.create(order=order, **item)
            item['product'].stock -= item['quantity']
            item['product'].save(update_fields=['stock'])
        PaymentService.charge(user=user, amount=order.total)
        return order
\`\`\`

\`\`\`python
# selectors.py — Complex read queries
from django.db.models import Q, Count, Prefetch

class OrderSelector:
    @staticmethod
    def list_for_user(*, user, status=None, search=None):
        qs = (
            Order.objects
            .filter(user=user)
            .select_related('user', 'shipping_address')
            .prefetch_related(
                Prefetch('items', queryset=OrderItem.objects.select_related('product'))
            )
            .annotate(item_count=Count('items'))
        )
        if status:
            qs = qs.filter(status=status)
        if search:
            qs = qs.filter(Q(id__icontains=search) | Q(items__product__name__icontains=search))
        return qs.distinct().order_by('-created_at')
\`\`\`

### Serializers: Advanced Patterns

**Separate read and write serializers:**
\`\`\`python
class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list endpoints."""
    item_count = serializers.IntegerField(read_only=True)
    user = UserMinimalSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'total', 'item_count', 'user', 'created_at']


class OrderDetailSerializer(serializers.ModelSerializer):
    """Full serializer for retrieve endpoints."""
    items = OrderItemSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    shipping_address = AddressSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'total', 'items', 'user', 'shipping_address', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.Serializer):
    """Write serializer — validates input, delegates to service."""
    items = OrderItemInputSerializer(many=True)
    shipping_address_id = serializers.PrimaryKeyRelatedField(queryset=Address.objects.all())

    def create(self, validated_data):
        return OrderService.place_order(
            user=self.context['request'].user,
            items=validated_data['items'],
            shipping_address=validated_data['shipping_address_id'],
        )
\`\`\`

**Writable nested serializers:**
\`\`\`python
class ProjectSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, required=False)

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'tags']

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        project = Project.objects.create(**validated_data)
        for tag_data in tags_data:
            tag, _ = Tag.objects.get_or_create(**tag_data)
            project.tags.add(tag)
        return project

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        instance = super().update(instance, validated_data)
        if tags_data is not None:
            instance.tags.clear()
            for tag_data in tags_data:
                tag, _ = Tag.objects.get_or_create(**tag_data)
                instance.tags.add(tag)
        return instance
\`\`\`

**Dynamic field serializers:**
\`\`\`python
class DynamicFieldsSerializer(serializers.ModelSerializer):
    """Pass ?fields=id,name,email to limit response fields."""
    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            for field_name in set(self.fields) - allowed:
                self.fields.pop(field_name)
\`\`\`

### ViewSets: Advanced Patterns

**Use \`get_serializer_class()\` for action-specific serializers:**
\`\`\`python
class OrderViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    filterset_class = OrderFilterSet
    search_fields = ['items__product__name']
    ordering_fields = ['created_at', 'total']
    ordering = ['-created_at']

    def get_queryset(self):
        return OrderSelector.list_for_user(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        if self.action == 'retrieve':
            return OrderDetailSerializer
        if self.action in ('create',):
            return OrderCreateSerializer
        return OrderUpdateSerializer

    def perform_create(self, serializer):
        serializer.save()  # Service called inside serializer.create()

    @extend_schema(request=None, responses={200: OrderDetailSerializer})
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        OrderService.cancel_order(order=order, user=request.user)
        return Response(OrderDetailSerializer(order).data)
\`\`\`

**Bulk operations:**
\`\`\`python
class BulkActionSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.IntegerField(), min_length=1, max_length=100)
    action = serializers.ChoiceField(choices=['archive', 'delete', 'export'])

@extend_schema(request=BulkActionSerializer, responses={200: None})
@action(detail=False, methods=['post'])
def bulk_action(self, request):
    serializer = BulkActionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    qs = self.get_queryset().filter(id__in=serializer.validated_data['ids'])
    action = serializer.validated_data['action']
    if action == 'archive':
        qs.update(status='archived')
    elif action == 'delete':
        qs.delete()
    return Response(status=status.HTTP_200_OK)
\`\`\`

### QuerySet Optimization

**ALWAYS optimize queries. N+1 queries are unacceptable.**

\`\`\`python
# BAD — N+1 queries
orders = Order.objects.all()
for order in orders:
    print(order.user.email)        # 1 query per order
    for item in order.items.all(): # 1 query per order
        print(item.product.name)   # 1 query per item

# GOOD — 3 queries total
orders = (
    Order.objects
    .select_related('user')
    .prefetch_related(
        Prefetch('items', queryset=OrderItem.objects.select_related('product'))
    )
)
\`\`\`

**Use \`only()\` / \`defer()\` for large tables:**
\`\`\`python
# Only load fields you need for list views
Product.objects.only('id', 'name', 'price', 'thumbnail').filter(is_active=True)
\`\`\`

**Use \`Subquery\` and \`OuterRef\` for correlated queries:**
\`\`\`python
from django.db.models import Subquery, OuterRef

latest_comment = Comment.objects.filter(
    post=OuterRef('pk')
).order_by('-created_at')

posts = Post.objects.annotate(
    latest_comment_text=Subquery(latest_comment.values('text')[:1])
)
\`\`\`

### Custom Permissions

\`\`\`python
# permissions.py
from rest_framework.permissions import BasePermission

class IsOwner(BasePermission):
    """Object-level permission: only the owner can modify."""
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return request.user and request.user.is_staff


class HasRole(BasePermission):
    """Usage: permission_classes = [HasRole('manager')]"""
    def __init__(self, role):
        self.role = role

    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role == self.role
\`\`\`

**Combine permissions per action:**
\`\`\`python
class ProjectViewSet(ModelViewSet):
    def get_permissions(self):
        if self.action in ('update', 'partial_update', 'destroy'):
            return [IsAuthenticated(), IsOwner()]
        if self.action == 'create':
            return [IsAuthenticated()]
        return [AllowAny()]
\`\`\`

### Custom Filters with django-filter

\`\`\`python
# filters.py
import django_filters
from .models import Order

class OrderFilterSet(django_filters.FilterSet):
    min_total = django_filters.NumberFilter(field_name='total', lookup_expr='gte')
    max_total = django_filters.NumberFilter(field_name='total', lookup_expr='lte')
    created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    status = django_filters.MultipleChoiceFilter(choices=Order.STATUS_CHOICES)

    class Meta:
        model = Order
        fields = ['status', 'min_total', 'max_total', 'created_after', 'created_before']
\`\`\`

### Pagination: Cursor-Based for Large Datasets

\`\`\`python
# pagination.py
from rest_framework.pagination import CursorPagination

class TimelinePagination(CursorPagination):
    page_size = 50
    ordering = '-created_at'
    cursor_query_param = 'cursor'
\`\`\`

Use in viewset: \`pagination_class = TimelinePagination\`

### Throttling

\`\`\`python
# In settings
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': ['rest_framework.throttling.ScopedRateThrottle'],
    'DEFAULT_THROTTLE_RATES': {
        'auth': '5/min',
        'uploads': '20/hour',
        'burst': '60/min',
    },
}

# In view
class LoginView(APIView):
    throttle_scope = 'auth'
\`\`\`

### Caching

\`\`\`python
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

class ProductViewSet(ModelViewSet):
    @method_decorator(cache_page(60 * 15))  # 15 min cache
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
\`\`\`

**Conditional caching with ETags:**
\`\`\`python
from rest_framework_condition import condition
from hashlib import md5

def product_etag(request, pk=None):
    product = Product.objects.only('updated_at').get(pk=pk)
    return md5(str(product.updated_at).encode()).hexdigest()

class ProductViewSet(ModelViewSet):
    @condition(etag_func=product_etag)
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
\`\`\`

### Error Handling

\`\`\`python
# exceptions.py
from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        response.data = {
            'error': {
                'code': response.status_code,
                'message': response.data.get('detail', response.data),
            }
        }
    return response
\`\`\`

Register in settings: \`'EXCEPTION_HANDLER': 'config.exceptions.custom_exception_handler'\`

### Versioning

\`\`\`python
# settings
REST_FRAMEWORK = {
    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.URLPathVersioning',
    'ALLOWED_VERSIONS': ['v1', 'v2'],
    'DEFAULT_VERSION': 'v1',
}

# urls.py
urlpatterns = [
    path('api/<version>/', include('apps.core.urls')),
]

# views.py — Version-specific behavior
class UserViewSet(ModelViewSet):
    def get_serializer_class(self):
        if self.request.version == 'v2':
            return UserV2Serializer
        return UserV1Serializer
\`\`\`

### Signals — Use Responsibly

\`\`\`python
# signals.py — Only for cross-cutting concerns (audit logs, cache invalidation)
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Order)
def notify_on_order_placed(sender, instance, created, **kwargs):
    if created:
        NotificationService.send_order_confirmation(order=instance)
\`\`\`

Register in \`apps.py\`:
\`\`\`python
class OrdersConfig(AppConfig):
    def ready(self):
        import apps.orders.signals  # noqa: F401
\`\`\`

> **Prefer explicit service calls over signals for business logic.** Signals make flow hard to trace.

### Testing: Senior-Level Patterns

\`\`\`python
import factory
from rest_framework.test import APITestCase, APIClient

# factories.py — Use factory_boy for test data
class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    email = factory.Sequence(lambda n: f'user{n}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')


class OrderFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Order
    user = factory.SubFactory(UserFactory)
    status = 'pending'


# test_views.py
class OrderViewSetTest(APITestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_list_returns_only_own_orders(self):
        OrderFactory.create_batch(3, user=self.user)
        OrderFactory.create_batch(2)  # Other user's orders
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 3)

    def test_create_validates_stock(self):
        product = ProductFactory(stock=0)
        response = self.client.post('/api/orders/', {
            'items': [{'product_id': product.id, 'quantity': 1}],
            'shipping_address_id': AddressFactory(user=self.user).id,
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_cancel_forbidden_for_non_owner(self):
        order = OrderFactory()  # Different user
        response = self.client.post(f'/api/orders/{order.id}/cancel/')
        self.assertEqual(response.status_code, 403)
\`\`\`

**Test query count to prevent N+1 regressions:**
\`\`\`python
from django.test.utils import override_settings

def test_list_query_count(self):
    OrderFactory.create_batch(10, user=self.user)
    with self.assertNumQueries(3):  # 1 count + 1 orders + 1 prefetch items
        self.client.get('/api/orders/')
\`\`\`

### API Documentation with drf-spectacular

\`\`\`python
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample

@extend_schema_view(
    list=extend_schema(
        summary="List orders",
        parameters=[
            OpenApiParameter('status', str, description='Filter by status'),
            OpenApiParameter('search', str, description='Search by product name'),
        ],
    ),
    create=extend_schema(summary="Place a new order"),
    cancel=extend_schema(summary="Cancel an order", responses={200: OrderDetailSerializer}),
)
class OrderViewSet(ModelViewSet):
    ...
\`\`\`

### Key Principles

1. **Fat services, thin views** — Views handle HTTP; services handle logic
2. **Optimize every queryset** — Use \`select_related\`, \`prefetch_related\`, \`only\`, \`annotate\`
3. **Separate read/write serializers** — List views are lightweight, detail views are rich, write views validate input
4. **Test behavior, not implementation** — Test API contracts, permissions, and edge cases
5. **Use \`transaction.atomic\`** — Wrap multi-step mutations to prevent partial writes
6. **Document with \`extend_schema\`** — Every endpoint needs OpenAPI docs for frontend type generation
7. **Scope querysets to user** — Never return data the user shouldn't see
8. **Use cursor pagination for large datasets** — Offset pagination degrades at scale
9. **Throttle sensitive endpoints** — Auth, uploads, and expensive operations
10. **Version your API** — Plan for breaking changes from the start
`
  },
}
