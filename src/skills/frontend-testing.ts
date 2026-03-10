import type { Skill, SkillContext } from './types.js'

export const frontendTestingSkill: Skill = {
  id: 'frontend-testing',
  name: 'Frontend Testing Conventions',
  description: 'Test infrastructure, file placement, test utilities, and rules for when and how to write frontend tests.',

  render(_ctx: SkillContext): string {
    return `## Frontend Testing Conventions

### Stack
- **Vitest** — test runner (configured in \`vite.config.ts\`)
- **jsdom** — browser environment
- **React Testing Library** — component rendering and queries
- **\`@testing-library/user-event\`** — user interaction simulation
- **\`@testing-library/jest-dom\`** — DOM assertion matchers (e.g. \`toBeInTheDocument\`)

### Running Tests
- Run all tests: \`cd frontend && npm test\`
- Watch mode: \`cd frontend && npm run test:watch\`
- Run a specific file: \`cd frontend && npx vitest run src/pages/home/__tests__/home.spec.tsx\`
- Coverage: \`cd frontend && npm run test:coverage\`

### File Placement — Tests Live Next to the Code

> **RULE: Every test file goes in a \`__tests__/\` folder co-located with the code it tests. Never put tests in a top-level \`tests/\` directory.**

\`\`\`
pages/customers/
├── customers-page.tsx
├── customer-detail-page.tsx
├── __tests__/                        # Page integration tests
│   ├── customers-page.spec.tsx
│   └── customer-detail-page.spec.tsx
├── components/
│   ├── customer-card.tsx
│   ├── customer-list.tsx
│   ├── customer-form.tsx
│   └── __tests__/                    # Component unit tests
│       ├── customer-card.spec.tsx
│       ├── customer-list.spec.tsx
│       └── customer-form.spec.tsx
└── hooks/
    ├── use-customers-page.ts
    └── __tests__/                    # Hook tests
        └── use-customers-page.spec.ts
\`\`\`

The same pattern applies to \`features/\`, \`shared/\`, and \`router/\`:
\`\`\`
features/auth/
├── pages/
│   ├── login-page.tsx
│   └── __tests__/
│       └── login-page.spec.tsx
├── hooks/
│   └── __tests__/
shared/
├── components/
│   └── __tests__/
├── hooks/
│   └── __tests__/
router/
├── __tests__/
│   ├── paths.spec.ts
│   └── auth-guard.spec.tsx
\`\`\`

### Test File Naming
- Use \`.spec.tsx\` for component/page tests (JSX)
- Use \`.spec.ts\` for pure logic tests (hooks, utilities, no JSX)
- Name matches the source file: \`customer-card.tsx\` → \`customer-card.spec.tsx\`

### Always Use \`renderWithProviders\`

> **RULE: Never import \`render\` from \`@testing-library/react\` directly. Always use \`renderWithProviders\` from \`@/__tests__/test-utils\`.**

\`renderWithProviders\` wraps components with all app providers (ThemeProvider, QueryClientProvider, MemoryRouter) so tests match the real app environment.

\`\`\`tsx
import { screen } from '@/__tests__/test-utils'
import { renderWithProviders } from '@/__tests__/test-utils'
import { MyComponent } from '../my-component'

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
\`\`\`

**Options:**
\`\`\`tsx
renderWithProviders(<MyComponent />, {
  routerEntries: ['/customers/1'],  // Set initial route
  queryClient: customQueryClient,   // Custom query client
})
\`\`\`

**User interactions:**
\`\`\`tsx
const { user } = renderWithProviders(<MyComponent />)
await user.click(screen.getByRole('button', { name: 'Submit' }))
await user.type(screen.getByLabelText('Email'), 'test@example.com')
\`\`\`

### When to Write Tests

> **RULE: Every code change that touches pages, components, hooks, or utilities must include corresponding test updates.**

| What changed | Test required |
|---|---|
| New page | Add \`__tests__/<page>.spec.tsx\` with integration test |
| New component | Add \`__tests__/<component>.spec.tsx\` |
| New hook (with logic) | Add \`__tests__/<hook>.spec.ts\` |
| New utility function | Add \`__tests__/<util>.spec.ts\` |
| Modified page/component | Update existing test or add new test cases |
| Bug fix | Add regression test that would have caught the bug |
| Deleted page/component | Delete corresponding test file |

### What to Test

**Page integration tests** — test the page as a whole:
- Renders correct heading/title
- Loading state shows skeleton or spinner
- Error state shows error message
- Data renders correctly (mock the API hooks)
- User interactions (navigation, form submission, delete confirmation)

**Component unit tests** — test the component in isolation:
- Renders with required props
- Handles optional props correctly (present vs absent)
- Displays correct content based on props
- User interactions trigger correct callbacks
- Conditional rendering (empty state, loading state)

**Hook tests** — test custom hooks with logic:
- Returns correct initial state
- Transforms data correctly
- Side effects fire as expected

**Utility/pure function tests** — test input/output:
- Happy path
- Edge cases (empty input, null, special characters)
- Error cases

### Mocking Patterns

**Mock hooks (for page tests):**
\`\`\`tsx
vi.mock('@/api/hooks/customers')
vi.mock('@/features/auth/hooks/use-auth')

import { useCustomers } from '@/api/hooks/customers'

beforeEach(() => {
  vi.mocked(useCustomers).mockReturnValue({
    data: { customers: mockCustomers, total: 2 },
    isLoading: false,
    errorMessage: null,
  } as any)
})
\`\`\`

**Mock external UI libraries (for auth page tests):**
\`\`\`tsx
vi.mock('@blacksmith-ui/auth', () => ({
  LoginForm: ({ onSubmit, error, loading }: any) => (
    <form onSubmit={(e: any) => { e.preventDefault(); onSubmit({ email: 'test@test.com', password: 'pass' }) }}>
      {error && <div data-testid="error">{error.message}</div>}
      <button type="submit">Sign In</button>
    </form>
  ),
}))
\`\`\`

**Mock react-router-dom hooks (for detail pages):**
\`\`\`tsx
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useParams: () => ({ id: '1' }), useNavigate: () => mockNavigate }
})
\`\`\`

### Test Structure
\`\`\`tsx
import { screen, waitFor } from '@/__tests__/test-utils'
import { renderWithProviders } from '@/__tests__/test-utils'

// Mocks at the top, before imports of modules that use them
vi.mock('@/api/hooks/customers')

import { useCustomers } from '@/api/hooks/customers'
import CustomersPage from '../customers-page'

const mockCustomers = [
  { id: '1', title: 'Acme Corp', created_at: '2024-01-15T10:00:00Z' },
]

describe('CustomersPage', () => {
  beforeEach(() => {
    vi.mocked(useCustomers).mockReturnValue({ ... } as any)
  })

  it('renders page heading', () => {
    renderWithProviders(<CustomersPage />)
    expect(screen.getByText('Customers')).toBeInTheDocument()
  })

  it('shows error message when API fails', () => {
    vi.mocked(useCustomers).mockReturnValue({
      data: undefined,
      isLoading: false,
      errorMessage: 'Failed to load',
    } as any)

    renderWithProviders(<CustomersPage />)
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })
})
\`\`\`

### Key Rules

1. **Tests live next to code** — \`__tests__/\` folder alongside the source, not in a separate top-level directory
2. **Always use \`renderWithProviders\`** — never import render from \`@testing-library/react\` directly
3. **Every page gets an integration test** — at minimum: renders heading, handles loading, handles errors
4. **Every component gets a unit test** — at minimum: renders with required props, handles optional props
5. **Mock at the hook level** — mock \`useCustomers\`, not \`fetch\`. Mock \`useAuth\`, not the auth adapter
6. **Test behavior, not implementation** — query by role, text, or label, not by class names or internal state
7. **No test-only IDs unless necessary** — prefer \`getByRole\`, \`getByText\`, \`getByLabelText\` over \`getByTestId\`
8. **Keep tests focused** — each \`it()\` tests one behavior. Don't assert 10 things in one test
9. **Clean up mocks** — use \`beforeEach\` to reset mock return values so tests don't leak state
10. **Update tests when code changes** — if you modify a component, update its tests. If you delete a component, delete its tests
`
  },
}
