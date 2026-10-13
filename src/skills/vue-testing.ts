import type { Skill, SkillContext } from './types.js'

export const vueTestingSkill: Skill = {
  id: 'frontend-testing',
  name: 'Frontend Testing Conventions',
  description: 'Test infrastructure, file placement, test utilities, and rules for when and how to write tests for the Vue frontend.',

  render(_ctx: SkillContext): string {
    return `## Frontend Testing Conventions

### Stack
- **Vitest** — test runner (configured in \`vite.config.ts\`, globals on)
- **jsdom** — browser environment
- **Vue Testing Library** (\`@testing-library/vue\`) — component rendering and queries
- **\`@testing-library/user-event\`** — user interaction simulation
- **\`@testing-library/jest-dom\`** — DOM assertion matchers (e.g. \`toBeInTheDocument\`)

### Running Tests
- Run all tests: \`blacksmith test --frontend\`, or \`cd frontend && npm test\`
- Watch mode: \`cd frontend && npm run test:watch\`
- Run a specific file: \`cd frontend && npx vitest run src/pages/support/__tests__/SupportPage.spec.ts\`
- Coverage: \`cd frontend && npm run test:coverage\`
- Types: \`cd frontend && npm run typecheck\` (\`vue-tsc\`; plain \`tsc\` does not read \`.vue\` files)

### File Placement — Tests Live Next to the Code

> **RULE: Every test file goes in a \`__tests__/\` folder co-located with the code it tests. Never put tests in a top-level \`tests/\` directory.**

\`\`\`
pages/blog-posts/
├── BlogPostsPage.vue
├── BlogPostDetailPage.vue
├── __tests__/                         # Page tests
│   └── BlogPostsPage.spec.ts
├── components/
│   ├── BlogPostCard.vue
│   ├── BlogPostList.vue
│   ├── BlogPostForm.vue
│   └── __tests__/                     # Component tests
│       ├── BlogPostCard.spec.ts
│       └── BlogPostList.spec.ts
└── composables/
    └── __tests__/                     # Composable tests

api/composables/blog-posts/
└── __tests__/
    └── use-blog-posts-query.spec.ts   # Query composable against a stubbed fetch
\`\`\`

The same pattern applies to \`features/\`, \`shared/\`, and \`router/\`:
\`\`\`
features/auth/
└── __tests__/
    └── adapter.spec.ts
shared/
├── components/__tests__/NotFoundPage.spec.ts
└── utils/__tests__/api-error.spec.ts, color-mode.spec.ts
router/
└── __tests__/
    ├── paths.spec.ts
    ├── routes.spec.ts                 # Which layout each path opens
    └── guards.spec.ts                 # Auth guard, including the hard refresh
\`\`\`

### Test File Naming
- Every test is a \`.spec.ts\` file — Vue tests render components from TypeScript, there is no JSX
- Name matches the source file: \`BlogPostCard.vue\` → \`BlogPostCard.spec.ts\`, \`use-blog-posts-query.ts\` → \`use-blog-posts-query.spec.ts\`

### Test Rendering Setup

> **RULE: Never call \`render\` from \`@testing-library/vue\` directly. Use \`renderWithProviders\` from \`@/__tests__/test-utils\`, which mounts the component with exactly what \`main.ts\` installs.**

\`renderWithProviders(Component, options)\` installs the app's plugins through the same \`installPlugins\` as \`main.ts\` — a fresh Pinia, an in-memory Vue Router, Vue Query with retries off, and Nuxt UI — and mounts the component inside \`UApp\`, so modals, dropdowns and toasts (which render through \`Teleport\`) appear in the document. It also imports \`@/api/client\`, so the generated client has its base URL and auth interceptors as in the app.

| Option | Use |
|---|---|
| \`props\` | The component's props |
| \`slots\` | Slot content, as functions |
| \`route\` | The starting URL (default \`/\`) |
| \`routes\` | Real routes, for tests that navigate (the default stub resolves any link) |
| \`queryClient\` | Your own \`QueryClient\` (\`createTestQueryClient()\` is exported) |

It returns everything Testing Library's \`render\` does, plus \`user\` (user-event) and \`router\`.

\`src/__tests__/setup.ts\` loads jest-dom and \`jsdom-shims.ts\`, which mocks \`window.matchMedia\` and \`ResizeObserver\` and filters jsdom's "Could not parse CSS stylesheet" error (it cannot parse the CSS cascade layers Nuxt UI injects). Don't assert on Tailwind classes — query by role, text or label (loading grids expose \`role="status"\` with an \`aria-label\`).

**Usage:**
\`\`\`ts
import { screen, renderWithProviders } from '@/__tests__/test-utils'
import type { Post } from '@/api/generated'
import PostCard from '../PostCard.vue'

const post = { id: 42, title: 'A Post', description: '', created_at: '2024-01-15T10:00:00Z' } as Post

describe('PostCard', () => {
  it('links to the detail page', () => {
    renderWithProviders(PostCard, { props: { post } })

    expect(screen.getByRole('link')).toHaveAttribute('href', '/posts/42')
  })
})
\`\`\`

**User interactions:**
\`\`\`ts
const { user } = renderWithProviders(SupportPage)
await user.click(screen.getByRole('button', { name: faq.question }))
await user.type(screen.getByLabelText('Email address'), 'ada@example.com')

// Overlays mount after the click — use findBy*
expect(await screen.findByRole('dialog')).toBeInTheDocument()
\`\`\`

**Navigation:**
\`\`\`ts
const { user, router } = renderWithProviders(NotFoundPage, { route: '/missing' })
await router.isReady()

await user.click(screen.getByRole('button', { name: /back to home/i }))

await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/'))
\`\`\`

### When to Write Tests

> **RULE: Every code change that touches pages, components, composables, stores, guards or utilities must include corresponding test updates.**

| What changed | Test required |
|---|---|
| New page | Add \`__tests__/<Name>Page.spec.ts\` |
| New component | Add \`__tests__/<Component>.spec.ts\` |
| New composable (with logic) | Add \`__tests__/use-<name>.spec.ts\` |
| New store | Add \`__tests__/<name>-store.spec.ts\` |
| New or changed route guard | Extend \`router/__tests__/guards.spec.ts\` |
| New utility function | Add \`__tests__/<util>.spec.ts\` |
| Modified page/component | Update existing test or add new test cases |
| Bug fix | Add regression test that would have caught the bug |
| Deleted page/component | Delete corresponding test file |

### What to Test

**Page tests** — the page as a whole, with its API composables mocked:
- Renders the correct heading
- Loading state shows the skeleton
- Error state shows the error message
- Data renders correctly
- User interactions (opening the create modal, submitting, deleting)

**Component tests** — the component in isolation:
- Renders with required props
- Handles optional props (present vs absent)
- Emits the right events with the right payload (\`emitted()\` from the render result)
- Conditional rendering (empty state, loading state)

**Composable tests** — through a small host component, since composables need a component context:
- Returns the right initial state
- Reacts to its reactive inputs (a getter or ref changing)
- Side effects fire as expected

**Utility/pure function tests** — input/output:
- Happy path
- Edge cases (empty input, null, special characters)
- Error cases

### Mocking Patterns

**Mock API composables (for page tests).** The page reads refs, so the mock returns refs and computeds — not plain values:
\`\`\`ts
import { computed, ref } from 'vue'
import { screen, renderWithProviders } from '@/__tests__/test-utils'

vi.mock('@/api/composables/posts')

import { usePosts, useCreatePost } from '@/api/composables/posts'
import PostsPage from '../PostsPage.vue'

const items = [{ id: 1, title: 'First Post', description: '', created_at: '2024-01-15T10:00:00Z' }]

beforeEach(() => {
  vi.mocked(usePosts).mockReturnValue({
    data: ref({ posts: items, total: items.length }),
    isLoading: ref(false),
    errorMessage: computed(() => null),
  } as unknown as ReturnType<typeof usePosts>)

  vi.mocked(useCreatePost).mockReturnValue({
    mutate: vi.fn(),
    isPending: ref(false),
    errorMessage: computed(() => null),
    fieldErrors: computed(() => ({})),
    reset: vi.fn(),
  } as unknown as ReturnType<typeof useCreatePost>)
})
\`\`\`

**Test a query composable against the network.** Stub \`fetch\` and mount a host component; the generated client calls \`globalThis.fetch\` with a \`Request\`. This is how the generated \`use-<resources>-query.spec.ts\` proves a page change refetches:
\`\`\`ts
import { defineComponent, ref } from 'vue'
import { renderWithProviders } from '@/__tests__/test-utils'
import { usePosts } from '../use-posts-query'

it('refetches when the page passed as a getter changes', async () => {
  const fetchMock = vi.fn<(request: Request) => Promise<Response>>(async () =>
    new Response(JSON.stringify({ count: 0, next: null, previous: null, results: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
  vi.stubGlobal('fetch', fetchMock)
  const page = ref(1)

  renderWithProviders(
    defineComponent({
      setup() {
        usePosts(() => ({ page: page.value }))
        return () => null
      },
    }),
  )
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

  page.value = 2
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
})

afterEach(() => {
  vi.unstubAllGlobals()
})
\`\`\`

**Mock auth (for components that read the user):**
\`\`\`ts
import { computed, ref } from 'vue'

vi.mock('@/features/auth/composables/use-auth', () => ({
  useAuth: () => ({
    user: ref(null),
    isLoading: ref(false),
    isAuthenticated: computed(() => false),
    error: ref(null),
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))
\`\`\`

**Test a guard or store with fresh module state.** The auth adapter keeps the session in module state, so reset modules and import inside the test:
\`\`\`ts
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

async function guardedRouter() {
  vi.resetModules()
  const { installAuthGuard } = await import('../guards')

  setActivePinia(createPinia())
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', component: { render: () => null } },
      { path: '/dashboard', meta: { requiresAuth: true }, component: { render: () => null } },
    ],
  })
  installAuthGuard(router)
  return router
}
\`\`\`

**Route params:** pages take their params as props (\`props: true\` on the route), so pass them as props — \`renderWithProviders(PostDetailPage, { props: { id: '1' } })\` — rather than mocking \`useRoute\`.

### Test Structure
\`\`\`ts
import { computed, ref } from 'vue'
import { screen, renderWithProviders } from '@/__tests__/test-utils'

// Mocks at the top, before imports of modules that use them
vi.mock('@/api/composables/customers')

import { useCustomers } from '@/api/composables/customers'
import CustomersPage from '../CustomersPage.vue'

function mockQuery(errorMessage: string | null = null) {
  vi.mocked(useCustomers).mockReturnValue({
    data: ref(errorMessage ? undefined : { customers: [], total: 0 }),
    isLoading: ref(false),
    errorMessage: computed(() => errorMessage),
  } as unknown as ReturnType<typeof useCustomers>)
}

describe('CustomersPage', () => {
  beforeEach(() => {
    mockQuery()
  })

  it('renders the page heading', () => {
    renderWithProviders(CustomersPage)

    expect(screen.getByRole('heading', { name: 'Customers' })).toBeInTheDocument()
  })

  it('shows the error message when the request fails', () => {
    mockQuery('Failed to load customers')

    renderWithProviders(CustomersPage)

    expect(screen.getByText('Failed to load customers')).toBeInTheDocument()
  })
})
\`\`\`

### Key Rules

1. **Tests live next to code** — \`__tests__/\` folder alongside the source, never a separate top-level directory
2. **Always use \`renderWithProviders\`** — it installs the same plugins as \`main.ts\`; never mount with a hand-built set
3. **Every page gets a test** — at minimum: renders its heading, handles loading, handles errors
4. **Every component gets a test** — at minimum: renders with required props, handles optional props
5. **Mock at the composable level in page tests** — mock \`useCustomers\`, not \`fetch\`; mock \`useAuth\`, not the adapter. Stub \`fetch\` only to test the API composables themselves
6. **Mocks return refs** — a mocked composable returns \`ref()\` / \`computed()\` values, as the real one does
7. **Test behavior, not implementation** — query by role, text, or label, never by Tailwind classes or internal state
8. **No test-only IDs unless necessary** — prefer \`getByRole\`, \`getByText\`, \`getByLabelText\` over \`getByTestId\`
9. **Use \`findBy*\` or \`vi.waitFor\` for anything async** — overlays, navigation, refetches
10. **Clean up** — reset mock return values in \`beforeEach\`, \`vi.unstubAllGlobals()\` in \`afterEach\`; update or delete tests with the code they cover
`
  },
}
