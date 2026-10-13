---
sidebar_position: 3
---

# Authentication

:::note Express backends
The endpoints, request bodies and token shapes described here are identical on an
Express backend — it reproduces SimpleJWT's request/response contract deliberately.

**One behavioural difference:** Express tokens are stateless. Refresh rotates the pair,
as Django's `ROTATE_REFRESH_TOKENS` does, but there is no equivalent of
`BLACKLIST_AFTER_ROTATION` — the previous refresh token stays valid until it expires, and
logout does not invalidate anything server-side. If you need tokens to stop working the
moment they are rotated or a user signs out, persist issued refresh tokens and reject
rotated ones. See [Express Backend](../stack/backend-express.md).
:::

:::note FastAPI backends
The endpoints, request bodies and token shapes described here are identical on a FastAPI
backend — it reproduces SimpleJWT's request/response contract too. Like the Express
backend, its tokens are stateless: logout does not invalidate anything server-side.
:::


Blacksmith generates a complete JWT-based authentication system across both the backend and frontend.

## Backend: SimpleJWT

The backend uses **Django REST Framework SimpleJWT** for token-based authentication.

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/` | POST | Create a new user account |
| `/api/auth/login/` | POST | Obtain access and refresh tokens |
| `/api/auth/refresh/` | POST | Refresh an expired access token |
| `/api/auth/me/` | GET | Get the current authenticated user |

### Token Flow

1. User logs in with credentials → receives `access` and `refresh` tokens
2. Access token is included in `Authorization: Bearer <token>` header
3. When the access token expires, the refresh token is used to obtain a new one
4. If the refresh token expires, the user must log in again

### Users App

The pre-built `users` app in `backend/apps/users/` includes:

- Custom user model extending `AbstractUser`
- Registration serializer with password validation
- Login view returning JWT tokens
- User profile view

## Frontend: Auth Provider

The frontend includes a complete authentication system. React keeps the session in a context provider; Vue keeps it in a Pinia store behind the `useAuth()` composable. Both use the same auth adapter (`src/features/auth/adapter.ts`), which talks to the backend, stores the tokens and restores the session on reload.

### Components

| Component | Purpose |
|-----------|---------|
| `AuthProvider` (React) / `useAuthStore` + `useAuth` (Vue) | Hold the auth state and actions |
| `LoginPage` | Login form with validation |
| `RegisterPage` | Registration form with validation |
| Password Reset pages | Password reset flow |

### Auth Guards

Private routes are protected with authentication guards. In React they are wrapped in an `AuthGuard` component; in Vue they carry `meta.requiresAuth`, and a `router.beforeEach` guard (`src/router/guards.ts`) waits for the stored session before deciding, so a hard refresh on a private page keeps you signed in. The React version:

```typescript
// Protected routes require authentication
<Route element={<AuthGuard />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/products" element={<ProductList />} />
</Route>

// Guest routes redirect authenticated users away
<Route element={<GuestGuard />}>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
</Route>
```

### Using Auth in Components

```typescript
import { useAuth } from '@/features/auth';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Token Storage

Tokens are stored in `localStorage` (`src/api/token-storage.ts`), so a session survives page reloads and new tabs. The API client attaches the access token to every request. On a `401` it exchanges the refresh token for a new pair, and if that fails the user is signed out. On load, the auth adapter restores the session from stored tokens, renewing an expired access token first, before route guards decide anything. Signing out sends the refresh token to the backend so Django can blacklist it.

Because `localStorage` is readable by scripts on the page, keep XSS out of your app. For stricter requirements, have the backend set the refresh token as an `httpOnly` cookie instead.

## Creating a Superuser

To access the Django admin panel, create a superuser:

```bash
blacksmith backend createsuperuser
```

Then visit `http://localhost:8000/admin/` to access the Django admin.
