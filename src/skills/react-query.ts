import type { Skill, SkillContext } from './types.js'

export const reactQuerySkill: Skill = {
  id: 'react-query',
  name: 'TanStack React Query',
  description: 'API data fetching conventions using useApiQuery and useApiMutation wrappers.',

  render(_ctx: SkillContext): string {
    return `## TanStack React Query — API Data Fetching

> **RULE: Always use \`useApiQuery\` and \`useApiMutation\` instead of raw \`useQuery\` / \`useMutation\`.**
> These wrappers live in \`@/shared/hooks/\` and handle DRF error parsing, smart retry, and cache invalidation automatically.

### Queries — \`useApiQuery\`

Import: \`import { useApiQuery } from '@/shared/hooks/use-api-query'\`

Wraps \`useQuery\` with:
- **Smart retry** — skips 400, 401, 403, 404, 405, 409, 422 (retries others up to 2 times)
- **Parsed errors** — \`errorMessage\` (string) and \`apiError\` (structured) derived from \`result.error\`

\`\`\`tsx
// Basic list query using generated options
import { postsListOptions } from '@/api/generated/@tanstack/react-query.gen'

const { data, isLoading, errorMessage } = useApiQuery({
  ...postsListOptions({ query: { page: 1 } }),
})

// With select to transform data
const { data, errorMessage } = useApiQuery({
  ...postsListOptions({ query: { page: 1 } }),
  select: (data: any) => ({
    posts: data.results ?? [],
    total: data.count ?? 0,
  }),
})

// Detail query
import { postsRetrieveOptions } from '@/api/generated/@tanstack/react-query.gen'

const { data: post, isLoading, errorMessage } = useApiQuery({
  ...postsRetrieveOptions({ path: { id: id! } }),
})

// Conditional query (skip until id is available)
const { data } = useApiQuery({
  ...postsRetrieveOptions({ path: { id: id! } }),
  enabled: !!id,
})
\`\`\`

**Return type extends \`UseQueryResult\` with:**
| Field | Type | Description |
|-------|------|-------------|
| \`errorMessage\` | \`string \\| null\` | Human-readable error message |
| \`apiError\` | \`ApiError \\| null\` | Structured error with \`status\`, \`message\`, \`fieldErrors\` |

### Mutations — \`useApiMutation\`

Import: \`import { useApiMutation } from '@/shared/hooks/use-api-mutation'\`

Wraps \`useMutation\` with:
- **DRF error parsing** — \`fieldErrors\`, \`errorMessage\`, \`apiError\` derived from \`mutation.error\` (no local state)
- **Cache invalidation** — pass \`invalidateKeys\` to auto-invalidate queries on success

\`\`\`tsx
// Create mutation with cache invalidation
import {
  postsCreateMutation,
  postsListQueryKey,
} from '@/api/generated/@tanstack/react-query.gen'

const createPost = useApiMutation({
  ...postsCreateMutation(),
  invalidateKeys: [postsListQueryKey()],
})

// Trigger the mutation
createPost.mutate({ body: { title: 'Hello', content: '...' } })

// Update mutation — invalidate both list and detail caches
import {
  postsUpdateMutation,
  postsRetrieveQueryKey,
} from '@/api/generated/@tanstack/react-query.gen'

const updatePost = useApiMutation({
  ...postsUpdateMutation(),
  invalidateKeys: [
    postsListQueryKey(),
    postsRetrieveQueryKey({ path: { id } }),
  ],
})

// Delete with async/await
const deletePost = useApiMutation({
  ...postsDestroyMutation(),
  invalidateKeys: [postsListQueryKey()],
})

const handleDelete = async () => {
  await deletePost.mutateAsync({ path: { id: id! } })
  navigate('/posts')
}
\`\`\`

**Return type extends \`UseMutationResult\` with:**
| Field | Type | Description |
|-------|------|-------------|
| \`fieldErrors\` | \`Record<string, string[]>\` | Per-field validation errors from DRF |
| \`errorMessage\` | \`string \\| null\` | General error message |
| \`apiError\` | \`ApiError \\| null\` | Full structured error |

### Error Display Patterns

\`\`\`tsx
// General error banner
{mutation.errorMessage && (
  <Alert variant="destructive">
    <AlertDescription>{mutation.errorMessage}</AlertDescription>
  </Alert>
)}

// Inline field errors in forms
const getFieldError = (field: string): string | undefined => {
  // Client-side (react-hook-form) errors take priority
  const clientError = form.formState.errors[field]?.message
  if (clientError) return clientError
  // Fall back to server-side field errors
  return mutation.fieldErrors[field]?.[0]
}

// Query error on a page
const { data, isLoading, errorMessage } = useApiQuery({ ... })

if (errorMessage) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  )
}
\`\`\`

### Creating Resource Hook Files

When building hooks for a resource, create two files:

**\`use-<resources>.ts\`** — List query hook:
\`\`\`tsx
import { useApiQuery } from '@/shared/hooks/use-api-query'
import { postsListOptions } from '@/api/generated/@tanstack/react-query.gen'

interface UsePostsParams {
  page?: number
  search?: string
  ordering?: string
}

export function usePosts(params: UsePostsParams = {}) {
  return useApiQuery({
    ...postsListOptions({
      query: {
        page: params.page ?? 1,
        search: params.search,
        ordering: params.ordering ?? '-created_at',
      },
    }),
    select: (data: any) => ({
      posts: data.results ?? [],
      total: data.count ?? 0,
      hasNext: !!data.next,
      hasPrev: !!data.previous,
    }),
  })
}
\`\`\`

**\`use-<resource>-mutations.ts\`** — Create/update/delete hooks:
\`\`\`tsx
import { useApiMutation } from '@/shared/hooks/use-api-mutation'
import {
  postsCreateMutation,
  postsUpdateMutation,
  postsDestroyMutation,
  postsListQueryKey,
  postsRetrieveQueryKey,
} from '@/api/generated/@tanstack/react-query.gen'

export function useCreatePost() {
  return useApiMutation({
    ...postsCreateMutation(),
    invalidateKeys: [postsListQueryKey()],
  })
}

export function useUpdatePost(id: string) {
  return useApiMutation({
    ...postsUpdateMutation(),
    invalidateKeys: [
      postsListQueryKey(),
      postsRetrieveQueryKey({ path: { id } }),
    ],
  })
}

export function useDeletePost() {
  return useApiMutation({
    ...postsDestroyMutation(),
    invalidateKeys: [postsListQueryKey()],
  })
}
\`\`\`

### Key Rules

1. **Never use raw \`useQuery\` or \`useMutation\`** — always go through \`useApiQuery\` / \`useApiMutation\`
2. **Never manage API error state with \`useState\`** — error state is derived from TanStack Query's \`error\` field
3. **Always pass \`invalidateKeys\`** on mutations that modify data — ensures the UI stays in sync
4. **Use generated options/mutations** from \`@/api/generated/@tanstack/react-query.gen\` — never write \`queryFn\` manually
5. **Use \`select\`** to reshape API responses at the hook level, not in components
6. **Use \`enabled\`** for conditional queries (e.g. waiting for an ID from URL params)
7. **Spread generated options first** (\`...postsListOptions()\`), then add overrides — this preserves the generated \`queryKey\` and \`queryFn\`
`
  },
}
