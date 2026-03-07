import type { Skill, SkillContext } from './types.js'

export const djangoSkill: Skill = {
  id: 'django',
  filename: 'django.md',

  render(_ctx: SkillContext): string {
    return `## Django Backend Conventions

### Models
- Models live in \`backend/apps/<app>/models.py\`
- Use Django's ORM. Inherit from \`models.Model\`
- Use \`TimeStampedModel\` pattern: add \`created_at\` and \`updated_at\` fields with \`auto_now_add\` and \`auto_now\`
- Register models in \`backend/apps/<app>/admin.py\` for Django admin
- Use descriptive \`verbose_name\` and \`verbose_name_plural\` in \`Meta\`
- Define \`__str__\` on every model for readable admin and debugging output
- Use \`related_name\` on all ForeignKey and ManyToManyField declarations
- Prefer \`TextField\` over \`CharField\` when there is no strict max length requirement

### Serializers
- Use Django REST Framework serializers in \`backend/apps/<app>/serializers.py\`
- Prefer \`ModelSerializer\` for standard CRUD operations
- Use \`serializers.Serializer\` for custom input/output that does not map to a model
- Add per-field validation via \`validate_<field>(self, value)\` methods
- Add cross-field validation via \`validate(self, attrs)\`
- Use \`SerializerMethodField\` for computed read-only fields
- Nest related serializers for read endpoints; use PrimaryKeyRelatedField for write endpoints
- Keep serializers thin — move business logic to model methods or service functions

### Views
- Use DRF \`ModelViewSet\` for standard CRUD endpoints
- Use \`@action(detail=True|False)\` decorator for custom non-CRUD endpoints
- Apply permissions with \`permission_classes\` at the class or action level
- Use \`@extend_schema\` from \`drf-spectacular\` to document every endpoint — this powers the OpenAPI sync that generates frontend types
- Use \`filterset_fields\`, \`search_fields\`, and \`ordering_fields\` for queryable list endpoints
- Override \`get_queryset()\` to scope data to the current user when needed
- Override \`perform_create()\` to inject \`request.user\` or other context into the serializer save

### URLs
- Each app has its own \`urls.py\` with a \`DefaultRouter\`
- Register viewsets on the router: \`router.register('resources', ResourceViewSet)\`
- App URLs are included in \`backend/config/urls.py\` under \`/api/\`
- URL pattern: \`/api/<resource>/\` (list/create), \`/api/<resource>/<id>/\` (retrieve/update/delete)

### Settings
- Split settings: \`base.py\` (shared), \`development.py\` (local dev), \`production.py\` (deployment)
- Environment variables loaded from \`.env\` via \`django-environ\`
- Database: SQLite in development, configurable in production via \`DATABASE_URL\`
- \`INSTALLED_APPS\` is declared in \`base.py\` — add new apps there
- CORS, allowed hosts, and debug flags are environment-specific

### Migrations
- Run \`./venv/bin/python manage.py makemigrations <app>\` after model changes
- Run \`./venv/bin/python manage.py migrate\` to apply
- Never edit auto-generated migration files unless resolving a conflict
- Use \`RunPython\` in data migrations for one-time data transformations

### Testing
- Tests live in \`backend/apps/<app>/tests.py\` (or a \`tests/\` package for larger apps)
- Use \`APITestCase\` from DRF for API endpoint tests
- Use \`APIClient\` with \`force_authenticate(user)\` for authenticated requests
- Test both success and error paths (400, 401, 403, 404)
- Run all tests: \`cd backend && ./venv/bin/python manage.py test\`
- Run a single app: \`cd backend && ./venv/bin/python manage.py test apps.<app>\`

### Adding a New App Manually
1. Create the app directory under \`backend/apps/\` with \`__init__.py\`, \`models.py\`, \`views.py\`, \`serializers.py\`, \`urls.py\`, \`admin.py\`, \`tests.py\`
2. Add \`'apps.<app>'\` to \`INSTALLED_APPS\` in \`backend/config/settings/base.py\`
3. Include URLs in \`backend/config/urls.py\`: \`path('api/<app>/', include('apps.<app>.urls'))\`
4. Run \`makemigrations\` and \`migrate\`
5. Run \`blacksmith sync\` to update frontend types

### Common Patterns
- **Soft delete**: Add an \`is_active\` BooleanField and override \`get_queryset()\` to filter
- **Pagination**: Configured globally in \`REST_FRAMEWORK\` settings — default is \`PageNumberPagination\`
- **Permissions**: Use \`IsAuthenticated\` as default; create custom permissions in \`permissions.py\`
- **Signals**: Use sparingly; prefer explicit calls in serializer/view logic
- **Management commands**: Place in \`backend/apps/<app>/management/commands/\` for CLI tasks
`
  },
}
