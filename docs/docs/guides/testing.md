---
sidebar_position: 7
---

# Testing

Blacksmith projects include a complete frontend testing setup with Vitest, React Testing Library, and co-located test utilities. This guide covers the conventions, patterns, and tools for writing effective tests.

## Quick Start

```bash
# Run all frontend tests
blacksmith frontend test

# Watch mode (re-runs on file changes)
blacksmith frontend run test:watch

# With coverage report
blacksmith frontend run test:coverage
```

## Test Stack

| Tool | Purpose |
|------|---------|
| [Vitest](https://vitest.dev/) | Test runner, configured in `vite.config.ts` |
| [jsdom](https://github.com/jsdom/jsdom) | Browser environment simulation |
| [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Component rendering and DOM queries |
| [@testing-library/user-event](https://testing-library.com/docs/user-event/intro/) | Realistic user interaction simulation |
| [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) | DOM assertion matchers (e.g. `toBeInTheDocument`) |

## File Placement

Tests live in `__tests__/` folders **co-located with the source code they test**:

```
pages/customers/
├── customers-page.tsx
├── customer-detail-page.tsx
├── __tests__/                          # Page integration tests
│   ├── customers-page.spec.tsx
│   └── customer-detail-page.spec.tsx
├── components/
│   ├── customer-card.tsx
│   ├── customer-list.tsx
│   ├── customer-form.tsx
│   └── __tests__/                      # Component unit tests
│       ├── customer-card.spec.tsx
│       ├── customer-list.spec.tsx
│       └── customer-form.spec.tsx
└── hooks/
    ├── use-customers-page.ts
    └── __tests__/                      # Hook tests
        └── use-customers-page.spec.ts
```

### Naming Convention

- `.spec.tsx` for files containing JSX (components, pages)
- `.spec.ts` for pure logic (hooks, utilities, helpers)
- Name matches the source file: `customer-card.tsx` → `customer-card.spec.tsx`

## Test Utilities

### `renderWithProviders`

All component tests should use `renderWithProviders` from `src/__tests__/test-utils.tsx` instead of importing `render` from `@testing-library/react` directly. This wraps your component with all the app's providers:

- **ThemeProvider** — consistent light mode for deterministic tests
- **QueryClientProvider** — test-friendly QueryClient (no retries, no GC)
- **MemoryRouter** — routing support without a real browser history

```tsx
import { screen } from '@/__tests__/test-utils'
import { renderWithProviders } from '@/__tests__/test-utils'
import { CustomerCard } from '../customer-card'

it('renders the customer title', () => {
  renderWithProviders(
    <CustomerCard customer={{ id: '1', title: 'Acme Corp', created_at: '2024-01-15T10:00:00Z' }} />
  )
  expect(screen.getByText('Acme Corp')).toBeInTheDocument()
})
```

### Options

```tsx
renderWithProviders(<MyComponent />, {
  routerEntries: ['/customers/1'],  // Set initial route(s)
  queryClient: customQueryClient,   // Provide a custom QueryClient
})
```

### User Interactions

`renderWithProviders` returns a `user` instance from `@testing-library/user-event`:

```tsx
const { user } = renderWithProviders(<CustomerForm onSubmit={mockSubmit} />)

await user.type(screen.getByLabelText('Title'), 'Acme Corp')
await user.click(screen.getByRole('button', { name: 'Save' }))

expect(mockSubmit).toHaveBeenCalled()
```

## Writing Tests

### Page Integration Tests

Page tests verify the page works as a whole — rendering, loading states, error handling, and user interactions. Mock the data hooks, not `fetch`.

```tsx
// pages/customers/__tests__/customers-page.spec.tsx
import { screen } from '@/__tests__/test-utils'
import { renderWithProviders } from '@/__tests__/test-utils'

vi.mock('@/api/hooks/customers')

import { useCustomers } from '@/api/hooks/customers'
import CustomersPage from '../customers-page'

describe('CustomersPage', () => {
  beforeEach(() => {
    vi.mocked(useCustomers).mockReturnValue({
      data: { customers: [{ id: '1', title: 'Acme', created_at: '2024-01-15T10:00:00Z' }], total: 1 },
      isLoading: false,
      errorMessage: null,
    } as any)
  })

  it('renders page heading', () => {
    renderWithProviders(<CustomersPage />)
    expect(screen.getByText('Customers')).toBeInTheDocument()
  })

  it('shows error message when API fails', () => {
    vi.mocked(useCustomers).mockReturnValue({
      data: undefined,
      isLoading: false,
      errorMessage: 'Failed to load customers',
    } as any)

    renderWithProviders(<CustomersPage />)
    expect(screen.getByText('Failed to load customers')).toBeInTheDocument()
  })
})
```

**Every page test should cover at minimum:**

- Renders correctly with data
- Loading state (skeleton/spinner)
- Error state (error message display)

### Component Unit Tests

Component tests verify rendering and behavior in isolation.

```tsx
// pages/customers/components/__tests__/customer-list.spec.tsx
import { screen } from '@/__tests__/test-utils'
import { renderWithProviders } from '@/__tests__/test-utils'
import { CustomerList } from '../customer-list'

const mockCustomers = [
  { id: '1', title: 'Acme Corp', created_at: '2024-01-15T10:00:00Z' },
  { id: '2', title: 'Globex', description: 'A test company', created_at: '2024-02-20T10:00:00Z' },
]

describe('CustomerList', () => {
  it('shows loading skeletons when loading', () => {
    const { container } = renderWithProviders(<CustomerList customers={[]} isLoading />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(6)
  })

  it('shows empty message when no customers', () => {
    renderWithProviders(<CustomerList customers={[]} />)
    expect(screen.getByText(/no customers yet/i)).toBeInTheDocument()
  })

  it('renders customer cards', () => {
    renderWithProviders(<CustomerList customers={mockCustomers} />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Globex')).toBeInTheDocument()
  })
})
```

### Form Tests

```tsx
// pages/customers/components/__tests__/customer-form.spec.tsx
import { screen } from '@/__tests__/test-utils'
import { renderWithProviders } from '@/__tests__/test-utils'
import { CustomerForm } from '../customer-form'

describe('CustomerForm', () => {
  it('renders all form fields', () => {
    renderWithProviders(<CustomerForm onSubmit={vi.fn()} />)
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('shows error message', () => {
    renderWithProviders(<CustomerForm onSubmit={vi.fn()} errorMessage="Title already exists" />)
    expect(screen.getByText('Title already exists')).toBeInTheDocument()
  })

  it('disables submit when saving', () => {
    renderWithProviders(<CustomerForm onSubmit={vi.fn()} isSubmitting />)
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()
  })
})
```

### Pure Function Tests

No JSX needed — test input/output directly.

```tsx
// shared/hooks/__tests__/api-error.spec.ts
import { parseApiError } from '../api-error'

describe('parseApiError', () => {
  it('parses DRF detail error', () => {
    const result = parseApiError({ status: 404, error: { detail: 'Not found.' } })
    expect(result.message).toBe('Not found.')
    expect(result.status).toBe(404)
  })

  it('parses field errors', () => {
    const result = parseApiError({
      status: 400,
      error: { title: ['This field is required.'] },
    })
    expect(result.fieldErrors.title).toEqual(['This field is required.'])
  })
})
```

## Mocking Patterns

### Mock API Hooks

```tsx
vi.mock('@/api/hooks/customers')

import { useCustomers } from '@/api/hooks/customers'

beforeEach(() => {
  vi.mocked(useCustomers).mockReturnValue({
    data: { customers: [], total: 0 },
    isLoading: false,
    errorMessage: null,
  } as any)
})
```

### Mock Auth

```tsx
vi.mock('@/features/auth/hooks/use-auth')

import { useAuth } from '@/features/auth/hooks/use-auth'

vi.mocked(useAuth).mockReturnValue({
  user: { displayName: 'Alice', email: 'alice@example.com' },
  isAuthenticated: true,
  isLoading: false,
} as any)
```

### Mock React Router Hooks

```tsx
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => mockNavigate,
  }
})
```

### Mock External UI Libraries

For components from `@blacksmith-ui/auth` that are complex to render in tests:

```tsx
vi.mock('@blacksmith-ui/auth', () => ({
  LoginForm: ({ onSubmit, error, loading }: any) => (
    <form onSubmit={(e: any) => {
      e.preventDefault()
      onSubmit({ email: 'test@example.com', password: 'password' })
    }}>
      {error && <div data-testid="error">{error.message}</div>}
      {loading && <div>Loading...</div>}
      <button type="submit">Sign In</button>
    </form>
  ),
}))
```

## Best Practices

1. **Test behavior, not implementation** — query by role, text, or label, not by class names or CSS selectors
2. **Mock at the hook level** — mock `useCustomers`, not `fetch`. This keeps tests focused on the component's behavior
3. **One assertion per test** — each `it()` should test one specific behavior
4. **Use `beforeEach` for mock setup** — prevents state leaking between tests
5. **Prefer `getByRole` and `getByText`** — use `getByTestId` only as a last resort
6. **Keep tests focused** — a component test doesn't need to test its child components in detail
7. **Update tests with code** — when you modify a component, update its tests. When you delete a component, delete its tests
