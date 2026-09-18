import type { Skill, SkillContext } from './types.js'

export const expressSkill: Skill = {
  id: 'express',
  name: 'Express Backend Conventions',
  description: 'Module layout, routes, controllers, services, middleware, and testing patterns for the Express backend.',

  render(_ctx: SkillContext): string {
    return `## Express Backend Conventions

The backend is TypeScript + Express 5 + Prisma. Every feature is a **module** under
\`backend/src/modules/<resource>/\`, and every module has the same four files.

### Module Layout

\`\`\`
src/modules/posts/
├── posts.schemas.ts      # Zod schemas — validation AND the OpenAPI contract
├── posts.service.ts      # business logic, the only place that touches Prisma
├── posts.controller.ts   # request/response handling, no business logic
├── posts.routes.ts       # Express routes + OpenAPI registration
└── __tests__/
    └── posts.spec.ts     # supertest integration tests
\`\`\`

Register a new module in \`src/modules/index.ts\` between the marker comments —
\`blacksmith make:resource\` does this for you.

### The Layers, and What Belongs in Each

- **schemas** — Zod objects. One per request body, one per response. Call
  \`.openapi('Name')\` on each so it lands in the OpenAPI document as a named
  component.
- **service** — all business logic and every Prisma call. Takes plain
  arguments, returns plain data, throws \`ApiError\`. Never touches \`req\`/\`res\`,
  which is what makes it callable from scripts and jobs.
- **controller** — reads the request, calls the service, sets the status code.
  Should be one or two lines per handler.
- **routes** — wires middleware and registers the OpenAPI path. See the
  \`express-openapi\` skill; getting this wrong breaks \`blacksmith sync\`.

### Async Errors

Express 5 forwards rejected promises to the error handler automatically.
Write plain \`async\` handlers — **no try/catch, no asyncHandler wrapper**:

\`\`\`ts
export async function retrieve(req: Request, res: Response): Promise<void> {
  res.json(await service.getPost(requireUser(req), resourceId(req)))
}
\`\`\`

### Errors Are a Contract

The React client parses Django REST Framework's error shapes, so the backend
must produce them. Always throw \`ApiError\` from \`src/utils/errors.js\`:

\`\`\`ts
throw ApiError.notFound()                                  // { "detail": "Not found." }
throw ApiError.nonField('Invalid email or password.')      // { "non_field_errors": [...] }
throw ApiError.validation({ title: ['This field is required.'] })  // { "title": [...] }
\`\`\`

Never \`res.status(400).json({ error: '...' })\` — that shape is not understood
by the frontend's \`parseApiError\`.

### Authentication

- \`authenticate\` middleware verifies the Bearer token and sets \`req.user\`
- \`requireUser(req)\` inside a handler returns the user, typed and non-null
- Mount \`authenticate\` once per router with \`router.use(authenticate)\` rather
  than repeating it on every route

### Scoping to the Current User

Filter by owner in the **query**, never after fetching. For updates and
deletes use \`updateMany\`/\`deleteMany\` with an owner filter and check the
returned \`count\` — a bare \`update\` by id can modify another user's row:

\`\`\`ts
const { count } = await prisma.post.updateMany({
  where: { id, created_by_id: user.id },
  data: input,
})
if (count === 0) throw ApiError.notFound()
\`\`\`

Return **404, not 403**, for another user's record — existence should not leak.

### Pagination

List endpoints must return DRF's envelope, built with the \`paginated\` helper:

\`\`\`ts
res.json(paginated(req, results, count, page))
// { count, next, previous, results }
\`\`\`

The generated React hooks read \`results\` and \`count\` directly, so a bare array
breaks them.

### Naming

- Files are kebab-case and prefixed with the resource: \`blog-posts.service.ts\`
- Database fields are **snake_case** (\`created_at\`, \`created_by_id\`) because
  they are serialized straight to JSON and the frontend types come from that
- Exported routers are camelCase plural: \`blogPostsRouter\`

### Testing

Tests are \`*.spec.ts\` beside the code, run with vitest and supertest against a
real SQLite database. \`src/__tests__/setup.ts\` empties every table between
tests, so cases start from nothing. Use the \`createUser\` / \`authHeader\`
helpers from \`src/__tests__/test-utils.js\`.

Assert on **status codes and body shapes**, not just happy paths — the DRF
error contract is what the frontend depends on.

### Sync After Backend Changes (Fullstack Projects)

Changing a schema or a route changes the API contract. Run \`blacksmith sync\`
to regenerate the frontend's types, Zod schemas, and TanStack Query hooks.
\`blacksmith dev\` does this automatically when a \`.ts\` file changes.
`
  },
}
