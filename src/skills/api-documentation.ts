import type { Skill, SkillContext } from './types.js'

export const apiDocumentationSkill: Skill = {
  id: 'api-documentation',
  filename: 'api-documentation.md',

  render(_ctx: SkillContext): string {
    return `## API Documentation — drf-spectacular (OpenAPI / Swagger)

> **RULE: Every API endpoint MUST be documented with \`@extend_schema\` from \`drf-spectacular\`.**
> Undocumented endpoints break the frontend type generation pipeline (\`blacksmith sync\`).
> The OpenAPI schema powers auto-generated TypeScript types — accurate docs = accurate frontend types.

### Setup

drf-spectacular is already configured in \`backend/config/settings/base.py\`:

\`\`\`python
INSTALLED_APPS = [
    ...
    'drf_spectacular',
]

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'API',
    'DESCRIPTION': 'API documentation',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}
\`\`\`

Docs URLs in \`backend/config/urls.py\`:
\`\`\`python
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
\`\`\`

### Decorating ViewSets — MANDATORY

**Use \`@extend_schema_view\` on every ViewSet:**
\`\`\`python
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample, OpenApiResponse

@extend_schema_view(
    list=extend_schema(
        summary="List projects",
        description="Returns paginated list of projects for the authenticated user.",
        parameters=[
            OpenApiParameter('status', str, enum=['active', 'archived'], description='Filter by status'),
            OpenApiParameter('search', str, description='Search by name or description'),
            OpenApiParameter('ordering', str, description='Sort field (prefix with - for desc)', enum=['created_at', '-created_at', 'name', '-name']),
        ],
        responses={200: ProjectListSerializer},
    ),
    retrieve=extend_schema(
        summary="Get project details",
        responses={200: ProjectDetailSerializer},
    ),
    create=extend_schema(
        summary="Create a project",
        request=ProjectCreateSerializer,
        responses={201: ProjectDetailSerializer},
        examples=[
            OpenApiExample(
                'Create project',
                value={'name': 'My Project', 'description': 'A new project'},
                request_only=True,
            ),
        ],
    ),
    update=extend_schema(
        summary="Update a project",
        request=ProjectUpdateSerializer,
        responses={200: ProjectDetailSerializer},
    ),
    partial_update=extend_schema(
        summary="Partially update a project",
        request=ProjectUpdateSerializer,
        responses={200: ProjectDetailSerializer},
    ),
    destroy=extend_schema(
        summary="Delete a project",
        responses={204: None},
    ),
)
class ProjectViewSet(ModelViewSet):
    ...
\`\`\`

**Custom actions MUST also be decorated:**
\`\`\`python
@extend_schema(
    summary="Archive a project",
    request=None,
    responses={200: ProjectDetailSerializer},
)
@action(detail=True, methods=['post'])
def archive(self, request, pk=None):
    project = self.get_object()
    ProjectService.archive(project=project)
    return Response(ProjectDetailSerializer(project).data)


@extend_schema(
    summary="Bulk delete projects",
    request=BulkDeleteSerializer,
    responses={204: None},
)
@action(detail=False, methods=['post'])
def bulk_delete(self, request):
    ...
\`\`\`

### Decorating APIViews

\`\`\`python
class DashboardStatsView(APIView):
    @extend_schema(
        summary="Get dashboard statistics",
        responses={200: DashboardStatsSerializer},
    )
    def get(self, request):
        stats = DashboardSelector.get_stats(user=request.user)
        return Response(DashboardStatsSerializer(stats).data)
\`\`\`

### Serializer Documentation

**Use \`help_text\` on serializer fields — these become field descriptions in the schema:**
\`\`\`python
class ProjectCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, help_text="The project name. Must be unique per user.")
    description = serializers.CharField(required=False, help_text="Optional project description.")
    status = serializers.ChoiceField(
        choices=['active', 'archived'],
        default='active',
        help_text="Initial project status.",
    )
    tags = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="List of tag names to attach.",
    )
\`\`\`

**Use \`@extend_schema_serializer\` for serializer-level docs:**
\`\`\`python
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample

@extend_schema_serializer(
    examples=[
        OpenApiExample(
            'Project response',
            value={
                'id': 1,
                'name': 'My Project',
                'status': 'active',
                'created_at': '2025-01-15T10:30:00Z',
            },
            response_only=True,
        ),
    ]
)
class ProjectDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'status', 'created_at', 'updated_at']
\`\`\`

### Response Types

**Explicitly declare all possible response codes:**
\`\`\`python
@extend_schema(
    summary="Place an order",
    request=OrderCreateSerializer,
    responses={
        201: OrderDetailSerializer,
        400: OpenApiResponse(description="Validation error (insufficient stock, invalid address, etc.)"),
        401: OpenApiResponse(description="Authentication required"),
        403: OpenApiResponse(description="Insufficient permissions"),
    },
)
def create(self, request, *args, **kwargs):
    ...
\`\`\`

### Enum and Choice Fields

**Use \`@extend_schema_field\` for custom field types:**
\`\`\`python
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes

@extend_schema_field(OpenApiTypes.STR)
class ColorField(serializers.Field):
    ...
\`\`\`

### Polymorphic / Union Responses

\`\`\`python
from drf_spectacular.utils import PolymorphicProxySerializer

@extend_schema(
    responses=PolymorphicProxySerializer(
        component_name='Notification',
        serializers={
            'email': EmailNotificationSerializer,
            'sms': SmsNotificationSerializer,
            'push': PushNotificationSerializer,
        },
        resource_type_field_name='type',
    )
)
def list(self, request):
    ...
\`\`\`

### Pagination in Schema

drf-spectacular auto-wraps list responses with pagination. If using custom pagination:
\`\`\`python
from drf_spectacular.utils import extend_schema

@extend_schema(
    summary="List items",
    responses=ItemSerializer(many=True),  # Pagination wrapper is auto-applied
)
def list(self, request, *args, **kwargs):
    ...
\`\`\`

### Tags for Grouping

**Group endpoints by feature using tags:**
\`\`\`python
@extend_schema_view(
    list=extend_schema(tags=['Orders']),
    create=extend_schema(tags=['Orders']),
    retrieve=extend_schema(tags=['Orders']),
)
class OrderViewSet(ModelViewSet):
    ...
\`\`\`

Or set a default tag via \`SPECTACULAR_SETTINGS\`:
\`\`\`python
SPECTACULAR_SETTINGS = {
    'TAGS': [
        {'name': 'Auth', 'description': 'Authentication endpoints'},
        {'name': 'Orders', 'description': 'Order management'},
        {'name': 'Products', 'description': 'Product catalog'},
    ],
}
\`\`\`

### Authentication in Schema

\`\`\`python
SPECTACULAR_SETTINGS = {
    'SECURITY': [{'jwtAuth': []}],
    'APPEND_COMPONENTS': {
        'securitySchemes': {
            'jwtAuth': {
                'type': 'http',
                'scheme': 'bearer',
                'bearerFormat': 'JWT',
            }
        }
    },
}
\`\`\`

### Excluding Endpoints

\`\`\`python
@extend_schema(exclude=True)
@action(detail=False, methods=['get'])
def internal_health_check(self, request):
    ...
\`\`\`

### Generating and Validating the Schema

\`\`\`bash
# Generate schema file
./venv/bin/python manage.py spectacular --file schema.yml

# Validate schema for errors
./venv/bin/python manage.py spectacular --validate
\`\`\`

> **Always run \`--validate\` after adding new endpoints.** Fix any warnings before committing.

### Rules

1. **Every ViewSet** must have \`@extend_schema_view\` with summaries for all actions
2. **Every custom \`@action\`** must have its own \`@extend_schema\` decorator
3. **Every serializer field** that isn't self-explanatory must have \`help_text\`
4. **Request and response serializers** must be explicitly declared — do not rely on auto-detection for non-trivial endpoints
5. **All error responses** (400, 401, 403, 404) should be documented with \`OpenApiResponse\`
6. **Run \`manage.py spectacular --validate\`** before committing to catch schema issues early
7. **Use examples** (\`OpenApiExample\`) for complex request/response bodies
8. **Group endpoints with tags** to keep Swagger UI organized
`
  },
}
