---
sidebar_position: 7
---

# Testing

:::note Express backends
Backend tests use Vitest + Supertest rather than pytest. Specs live beside the code as
`*.spec.ts`, run sequentially against a shared SQLite database, and every table is emptied
between tests. `blacksmith test` works the same either way.
:::


Blacksmith projects ship with a working test suite on both sides: **pytest** for the
Django backend and **Vitest** with React Testing Library for the React frontend. A
freshly generated project has passing tests from the first commit, and
`make:resource` scaffolds tests for every resource you add.

## Quick Start

```bash
# Run every suite the project has
blacksmith test

# One side only
blacksmith test --backend
blacksmith test --frontend

# With coverage
blacksmith test --coverage

# Watch one suite while you work
blacksmith test --frontend --watch
```

See [`blacksmith test`](../commands/test.md) for the full command reference.

---

# Backend (pytest)

## Test Stack

| Tool | Purpose |
|------|---------|
| [pytest](https://docs.pytest.org/) | Test runner, configured in `pytest.ini` |
| [pytest-django](https://pytest-django.readthedocs.io/) | Django integration: the `db` fixture, settings wiring, `django_user_model` |
| [pytest-cov](https://pytest-cov.readthedocs.io/) | Coverage reporting |
| [DRF APIClient](https://www.django-rest-framework.org/api-guide/testing/) | Authenticated API requests |

## File Placement

Tests live in `tests.py` inside each app, next to the code they cover:

```
backend/
├── pytest.ini                  # DJANGO_SETTINGS_MODULE and discovery rules
├── conftest.py                 # Shared fixtures, available everywhere
├── config/settings/test.py     # Settings used only by the test suite
└── apps/
    ├── users/tests.py
    └── products/tests.py       # Created by make:resource
```

`pytest.ini` also picks up `test_*.py` and `*_tests.py`, so split a large
`tests.py` into a `tests/` package whenever it outgrows one file.

## Test Settings

The suite runs against `config/settings/test.py`, never your development
settings. It is deliberately self-contained so CI, a fresh clone and your
machine all behave identically:

- An **in-memory SQLite** database — fast, and never touches `db.sqlite3`
- **MD5 password hashing** — the default PBKDF2 hasher dominates runtime when tests create users
- A **fixed `SECRET_KEY`** — the suite never reads your `.env`
- **`locmem` email** — assert on `django.core.mail.outbox` instead of sending

## Fixtures

`conftest.py` provides these to every test without an import:

| Fixture | What it gives you |
|---------|-------------------|
| `api_client` | An unauthenticated DRF `APIClient` |
| `auth_client` | An `APIClient` already authenticated as `user` |
| `user` | A saved ordinary user |
| `other_user` | A second user, for ownership and permission boundaries |
| `admin_user` | A superuser |
| `test_password` | The password every fixture user is created with |

```python
def test_returns_the_current_user(auth_client, user):
    response = auth_client.get('/api/auth/me/')

    assert response.status_code == 200
    assert response.data['email'] == user.email
```

Any test that touches the database needs either a fixture that already does
(`user`, `auth_client`, ...) or pytest-django's `db` fixture:

```python
def test_requires_authentication(api_client, db):
    assert api_client.get('/api/products/').status_code == 401
```

## Writing Tests

Group related cases in a class — no base class needed, and the name shows up in
the failure output:

```python
class TestCreateProduct:
    def test_creates_a_product(self, auth_client):
        response = auth_client.post('/api/products/', {'title': 'New Product'})

        assert response.status_code == 201
        assert response.data['title'] == 'New Product'

    def test_assigns_the_current_user_as_owner(self, auth_client, user):
        auth_client.post('/api/products/', {'title': 'New Product'})

        assert Product.objects.get(title='New Product').created_by == user
```

Resource viewsets are scoped to `created_by=request.user`, so always cover the
ownership boundary — `other_user` exists for exactly this:

```python
def test_returns_404_for_another_users_product(self, auth_client, other_user):
    theirs = Product.objects.create(title='Not Yours', created_by=other_user)

    response = auth_client.get(f'/api/products/{ theirs.id }/')

    assert response.status_code == 404
```

## Coverage

```bash
blacksmith test --backend --coverage
```

---

# Frontend (Vitest)

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

- **ChakraProvider** — the app's theme, for deterministic snapshots
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

### Mock Auth Hooks

For components that depend on the auth system, mock the `useAuth` hook:

```tsx
vi.mock('@/features/auth/hooks/use-auth')

import { useAuth } from '@/features/auth/hooks/use-auth'

const mockLogin = vi.fn().mockResolvedValue({ success: true })

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({
    login: mockLogin,
    error: null,
    isLoading: false,
  } as any)
})
```

## Best Practices

1. **Test behavior, not implementation** — query by role, text, or label, not by class names or CSS selectors
2. **Mock at the hook level** — mock `useCustomers`, not `fetch`. This keeps tests focused on the component's behavior
3. **One assertion per test** — each `it()` should test one specific behavior
4. **Use `beforeEach` for mock setup** — prevents state leaking between tests
5. **Prefer `getByRole` and `getByText`** — use `getByTestId` only as a last resort
6. **Keep tests focused** — a component test doesn't need to test its child components in detail
7. **Update tests with code** — when you modify a component, update its tests. When you delete a component, delete its tests

---

# Continuous Integration

Every generated project includes `.github/workflows/ci.yml`, which runs both
suites on pushes to `main` and on every pull request. Fullstack projects get two
parallel jobs; single-stack projects get the one that applies.

## What Runs

**Backend job**

1. Install Python dependencies from `requirements.txt`
2. `manage.py makemigrations --check --dry-run` — fails if a model change has no migration
3. `pytest --cov`

**Frontend job**

1. Rebuild the typed API client (fullstack only — see below)
2. `npm ci`
3. `npm run test`
4. `npm run build`

## Why CI Regenerates the API Client

`src/api/generated/` is git-ignored, because it is derived from the Django
schema rather than written by hand. That means it does not exist in a fresh
clone, so CI rebuilds it before type-checking the frontend:

```yaml
- name: Export OpenAPI schema
  run: python manage.py spectacular --file ../frontend/_schema.yml
  working-directory: backend

- name: Generate API client
  run: npx openapi-ts --input _schema.yml --output src/api/generated
```

`manage.py spectacular` writes the schema offline — no server needs to be
running. This is the same path [`blacksmith sync`](../commands/sync.md) takes
locally.

## Customizing

The workflow is yours once generated; Blacksmith never overwrites it. Common
changes:

- **Python or Node version** — edit `python-version` / `node-version`
- **A real database** — add a `services:` block for Postgres and point
  `config/settings/test.py` at it
- **Coverage thresholds** — add `--cov-fail-under=80` to the pytest step

:::note
An existing project created before CI shipped picks the workflow up the next
time you run [`blacksmith setup`](../commands/setup.md).
:::
