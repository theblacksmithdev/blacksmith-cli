import type { Skill, SkillContext } from './types.js'

export const backendModularizationSkill: Skill = {
  id: 'backend-modularization',
  name: 'Backend Modularization',
  description: 'When and how to promote Django modules (models, serializers, views, tests, admin) from single files to packages with per-class files.',

  render(_ctx: SkillContext): string {
    return `## Backend Modularization

> **RULE: When a Django module contains more than one class, promote it from a single file to a package (folder) with one class per file and re-export everything from \`__init__.py\`.**

This applies to \`models.py\`, \`serializers.py\`, \`views.py\`, \`admin.py\`, and \`tests.py\`.

### Single-Class Module — Keep as a File

When an app has only one model, one serializer, etc., a single file is fine:

\`\`\`
apps/posts/
├── __init__.py
├── models.py           # one model: Post
├── serializers.py      # one serializer: PostSerializer
├── views.py            # one viewset: PostViewSet
├── urls.py
├── admin.py
└── tests.py
\`\`\`

### Multi-Class Module — Promote to a Package

When a second class is added, convert the file to a package:

\`\`\`
apps/posts/
├── __init__.py
├── models/
│   ├── __init__.py     # from .post import *  /  from .comment import *
│   ├── post.py         # class Post(models.Model)
│   └── comment.py      # class Comment(models.Model)
├── serializers/
│   ├── __init__.py     # from .post_serializer import *  /  from .comment_serializer import *
│   ├── post_serializer.py
│   └── comment_serializer.py
├── views/
│   ├── __init__.py     # from .post_views import *  /  from .comment_views import *
│   ├── post_views.py
│   └── comment_views.py
├── admin/
│   ├── __init__.py     # from .post_admin import *  /  from .comment_admin import *
│   ├── post_admin.py
│   └── comment_admin.py
├── tests/
│   ├── __init__.py
│   ├── test_post.py
│   └── test_comment.py
├── urls.py
└── ...
\`\`\`

### The \`__init__.py\` Contract

Every package \`__init__.py\` re-exports all public names so that imports from outside the app remain unchanged:

\`\`\`python
# models/__init__.py
from .post import *
from .comment import *
\`\`\`

This means the rest of the codebase continues to use:
\`\`\`python
from apps.posts.models import Post, Comment
from apps.posts.serializers import PostSerializer, CommentSerializer
from apps.posts.views import PostViewSet, CommentViewSet
\`\`\`

No import paths change when you promote a file to a package — that is the whole point.

### File Naming Conventions

| Module | Single file | Package file names |
|---|---|---|
| Models | \`models.py\` | \`models/<model_name>.py\` (e.g. \`post.py\`, \`comment.py\`) |
| Serializers | \`serializers.py\` | \`serializers/<model_name>_serializer.py\` |
| Views | \`views.py\` | \`views/<model_name>_views.py\` |
| Admin | \`admin.py\` | \`admin/<model_name>_admin.py\` |
| Tests | \`tests.py\` | \`tests/test_<model_name>.py\` |

### Using \`__all__\` in Each File

Define \`__all__\` in each file to make the \`from .module import *\` explicit:

\`\`\`python
# models/post.py
from django.db import models

__all__ = ['Post']

class Post(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
\`\`\`

\`\`\`python
# serializers/post_serializer.py
from rest_framework import serializers
from apps.posts.models import Post

__all__ = ['PostSerializer']

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'
\`\`\`

### When to Promote

- **Do promote** when a module contains 2 or more classes (models, serializers, viewsets, admin classes)
- **Don't promote** \`urls.py\` — URL configuration is typically one file regardless of size, since routers naturally aggregate
- **Don't promote** a module just because it is long — if it has one class with many methods, keep it as a file; length alone is not a reason
- **Don't promote preemptively** — start with a single file and convert when the second class arrives

### Migration Considerations

When promoting \`models.py\` to a \`models/\` package, Django migrations continue to work as long as the import path in \`__init__.py\` is correct. Existing migrations reference the app label, not the file path, so no migration changes are needed.

### Utility Functions

> **RULE: Reuse before writing. If a function can be used outside the file it lives in, it belongs in utils.**

- **App-scoped utilities** → \`apps/<app>/utils.py\` (or \`utils/\` package if multiple files)
- **Project-wide utilities** → \`utils/\` at the backend root (e.g. \`utils/formatting.py\`, \`utils/permissions.py\`)

Before writing any helper function, search the codebase for an existing one. If the same logic exists in two places, extract it into a shared utility immediately.

\`\`\`python
# BAD — helper function sitting in views.py
def parse_date_range(request):
    ...

class ReportViewSet(ModelViewSet):
    def get_queryset(self):
        start, end = parse_date_range(self.request)
        ...

# GOOD — extracted to utils
# apps/reports/utils.py
def parse_date_range(request):
    ...

# apps/reports/views.py
from apps.reports.utils import parse_date_range
\`\`\`

\`utils.py\` follows the same promotion rule — when it has multiple unrelated groups of functions, promote it to a \`utils/\` package with focused files (\`utils/dates.py\`, \`utils/formatting.py\`, etc.) and re-export from \`__init__.py\`.

### Summary

1. **One class per file** when a module is promoted to a package
2. **\`__init__.py\` re-exports everything** — external imports never change
3. **Use \`__all__\`** in each file to be explicit about exports
4. **Promote at 2+ classes** — not preemptively, not based on line count alone
5. **\`urls.py\` stays a file** — it does not get promoted
6. **Extract reusable functions to utils** — search before writing, no duplicated logic
`
  },
}
