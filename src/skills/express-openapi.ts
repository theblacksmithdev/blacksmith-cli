import type { Skill, SkillContext } from './types.js'

export const expressOpenApiSkill: Skill = {
  id: 'express-openapi',
  name: 'API Documentation',
  description: 'zod-to-openapi conventions that keep the Express API schema in sync with the generated frontend client.',

  render(_ctx: SkillContext): string {
    return `## API Documentation — Zod + OpenAPI

> **RULE: Every route MUST be registered with \`registry.registerPath\`.**
> An unregistered route is invisible to \`blacksmith sync\`, so no types, no
> client function, and no React Query hook are generated for it.

### How It Fits Together

\`\`\`
Zod schema  →  registry.registerPath  →  npm run openapi  →  openapi.json
            →  blacksmith sync        →  frontend/src/api/generated/
\`\`\`

The document is built offline — \`npm run openapi\` never starts the server or
touches the database, which is why CI can generate the client from a clean
checkout.

### Always Import z From config/zod.js

\`\`\`ts
import { z } from '../../config/zod.js'   // correct — has .openapi()
import { z } from 'zod'                   // wrong — .openapi() is not defined
\`\`\`

That module calls \`extendZodWithOpenApi\` once, before any schema is defined.

### Registering a Route

Declare the route twice: once on the router, once in the registry. Keep them
adjacent so they cannot drift.

\`\`\`ts
registry.registerPath({
  method: 'get',
  path: '/api/posts/{id}/',
  operationId: 'posts_retrieve',
  tags: ['posts'],
  security: [{ [bearerAuth.name]: [] }],
  description: 'Get a single post.',
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'The post.', ...jsonContent(PostSchema) },
  },
})
postsRouter.get('/:id/', controller.retrieve)
\`\`\`

### operationId Determines the Generated Hook Names

This is the part that silently breaks things. The frontend hooks in
\`src/api/hooks/\` are named after the operation id:

| operationId | Generated |
|---|---|
| \`posts_list\` | \`postsListOptions\` |
| \`posts_retrieve\` | \`postsRetrieveOptions\` |
| \`posts_create\` | \`postsCreateMutation\` |
| \`posts_update\` | \`postsUpdateMutation\` |
| \`posts_partial_update\` | \`postsPartialUpdateMutation\` |
| \`posts_destroy\` | \`postsDestroyMutation\` |

Use exactly \`<snake_plural>_<action>\`. Renaming an operation id renames the
generated hook and breaks every component importing it.

### Paths Keep Their Trailing Slash

\`/api/posts/\` and \`/api/posts/{id}/\` — with the trailing slash, and starting
with the full \`/api\` prefix even though the router is mounted at a subpath.

### Path Params Are Strings

\`z.object({ id: z.string() })\`. The React pages take the id from
\`useParams\`, which is always a string; typing it as a number produces a client
the generated pages do not compile against. Parse it in the controller.

### Avoid z.coerce in Documented Schemas

A coerced number documents as \`integer | null\`. Keep coercion in the
validation schema and declare a plain type in the registered one:

\`\`\`ts
// validation — coerces the query string
export const PostQuerySchema = z.object({ page: z.coerce.number().int().optional() })

// documentation — the real wire contract
const LIST_QUERY = z.object({ page: z.number().int().optional() })
\`\`\`

### Name Your Components

Call \`.openapi('Name')\` on every schema so it becomes a named component rather
than being inlined:

\`\`\`ts
export const PostSchema = z.object({ /* ... */ }).openapi('Post')
export const PostRequestSchema = z.object({ /* ... */ }).openapi('PostRequest')
export const PatchedPostRequestSchema = PostRequestSchema.partial().openapi('PatchedPostRequest')
export const PaginatedPostListSchema = z.object({ /* ... */ }).openapi('PaginatedPostList')
\`\`\`

Those four names — \`X\`, \`XRequest\`, \`PatchedXRequest\`, \`PaginatedXList\` — are
the convention the frontend templates expect.

### Checking Your Work

\`\`\`bash
blacksmith backend run openapi   # writes openapi.json
blacksmith sync                  # regenerates the frontend client
\`\`\`

Swagger UI is served at \`/api/docs/\` and the raw document at \`/api/schema/\`.
\`src/__tests__/openapi.spec.ts\` asserts the operation ids — extend it when you
add a module.
`
  },
}
