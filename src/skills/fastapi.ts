import type { Skill, SkillContext } from './types.js'

export const fastapiSkill: Skill = {
  id: 'fastapi',
  name: 'FastAPI Backend Conventions',
  description: 'Package layout, routers, services, schemas, errors, auth, and testing patterns for the FastAPI backend.',

  render(_ctx: SkillContext): string {
    return `## FastAPI Backend Conventions

The backend is Python + FastAPI + Pydantic v2 + SQLAlchemy 2.0, with Alembic
for migrations. Every feature is a **package** under \`backend/app/<resource>/\`,
and every package has the same four modules.

### Package Layout

\`\`\`
app/
├── main.py            # the FastAPI app; routers are mounted here
├── config.py          # settings from the environment and .env
├── db.py              # engine, session, Base, User, utcnow()
├── errors.py          # DRF-shaped validation errors
├── pagination.py      # DRF-shaped page envelope helpers
├── fields.py          # shared Pydantic field types (UtcDatetime)
├── routers/auth.py    # auth endpoints and get_current_user
└── posts/
    ├── models.py      # SQLAlchemy model
    ├── schemas.py     # Pydantic request and response schemas
    ├── service.py     # business logic, the only place that queries the database
    └── router.py      # endpoints: HTTP in, service call, HTTP out
tests/
└── test_posts.py      # API tests through TestClient
\`\`\`

\`blacksmith make:resource\` creates all of this and mounts the router in
\`app/main.py\` between the \`# blacksmith:import\` and \`# blacksmith:routers\`
markers. Keep those markers in place.

### The Layers, and What Belongs in Each

- **schemas** — Pydantic models. One per response, one per request body, and a
  \`Patched<Name>Request\` for PATCH. Class names become OpenAPI component
  names, so keep them matching the Django/Express names (\`Post\`,
  \`PostRequest\`, \`PatchedPostRequest\`, \`PaginatedPostList\`).
- **service** — every query and write. Takes the session and the user, returns
  schemas, raises \`HTTPException\`. Never touches \`Request\`, which keeps it
  callable from scripts and tests.
- **router** — declares the endpoint, resolves dependencies, calls the
  service. One or two lines per handler.
- **models** — columns and relationships only; no business logic.

### OpenAPI Is the Frontend's Contract

\`blacksmith sync\` exports \`app.openapi()\` and generates the React client from
it, so the endpoint declaration *is* the frontend API:

- Set \`operation_id\` on every route to what drf-spectacular would emit for a
  ModelViewSet: \`posts_list\`, \`posts_create\`, \`posts_retrieve\`,
  \`posts_update\`, \`posts_partial_update\`, \`posts_destroy\`. The generated
  hooks are named from these (\`postsListOptions\`, \`postsCreateMutation\`).
- Set \`response_model\` so the response type is documented.
- Type path ids as \`str\` and parse them in the service. The React hooks pass
  route params straight from \`useParams\`; an \`int\` here makes the generated
  types disagree with them.
- Keep trailing slashes on every path (\`"/"\`, \`"/{id}/"\`), as Django does.

### Errors Are a Contract

The React client parses Django REST Framework's error shapes. \`app/errors.py\`
already turns request validation errors into DRF's 400
(\`{"title": ["This field is required."]}\`) and keeps FastAPI's 422s out of the
OpenAPI document. For errors you raise yourself:

\`\`\`python
raise HTTPException(status_code=404, detail="Not found.")          # {"detail": "..."}
raise HTTPException(status_code=400, detail="Old password is incorrect.")
\`\`\`

Never return a custom error body such as \`{"error": "..."}\`; the frontend's
\`parseApiError\` does not understand it.

### Authentication

Depend on \`get_current_user\` from \`app.routers.auth\` in every endpoint that
needs a signed-in user:

\`\`\`python
def list_posts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
\`\`\`

### Scoping to the Current User

Filter by owner in the **query**, never after fetching. The generated service
builds every query from \`owned_by(user)\`, and \`get_owned\` raises 404 for a row
that does not exist *or* belongs to someone else. Return **404, not 403**, so
existence does not leak.

### Pagination

List endpoints return DRF's envelope, built from \`app/pagination.py\`:

\`\`\`python
results, count = service.list_posts(db, user, page, search, ordering)
next_link, previous_link = page_links(request.url, page, count)
return schemas.PaginatedPostList(count=count, next=next_link, previous=previous_link, results=results)
\`\`\`

The generated React hooks read \`results\` and \`count\` directly, so a bare list
breaks them.

### Naming

- The package and table are snake_case plural: \`app/blog_posts/\`, \`blog_posts\`
- JSON fields are **snake_case** (\`created_at\`, \`created_by\`); the frontend
  types are generated from them
- Timestamps in responses use \`UtcDatetime\` from \`app/fields.py\`, so they
  serialize with a \`Z\` and the browser does not read them as local time

### Testing

Tests live in \`tests/\` and run with pytest (\`blacksmith test\`, or
\`blacksmith backend pytest\`). \`conftest.py\` points the app at a throwaway
SQLite database, builds it by running the Alembic migrations, and provides:

- \`api_client\` — anonymous
- \`auth_client\` — signed in as a new user
- \`other_client\` — signed in as a second user, for ownership tests

The database lasts the whole session, so create the rows a test needs through
the API and never assume a table is empty. Assert on **status codes and body
shapes**; the DRF error contract is what the frontend depends on.

### Sync After Backend Changes (Fullstack Projects)

Changing a schema or a route changes the API contract. Run \`blacksmith sync\`
to regenerate the frontend's types and TanStack Query hooks.
\`blacksmith dev\` does this automatically when a \`.py\` file changes.
`
  },
}
