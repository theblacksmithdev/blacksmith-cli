---
sidebar_position: 3
---

# Authentication

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

The frontend includes a complete authentication system built with React Context.

### Components

| Component | Purpose |
|-----------|---------|
| `AuthProvider` | Context provider managing auth state |
| `LoginPage` | Login form with validation |
| `RegisterPage` | Registration form with validation |
| Password Reset pages | Password reset flow |

### Auth Guards

React Router routes are protected with authentication guards:

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

Tokens are stored in memory and/or local storage, with the API client automatically attaching the access token to every request and refreshing it when needed.

## Creating a Superuser

To access the Django admin panel, create a superuser:

```bash
blacksmith backend createsuperuser
```

Then visit `http://localhost:8000/admin/` to access the Django admin.
