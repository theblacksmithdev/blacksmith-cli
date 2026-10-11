import type { Skill, SkillContext } from './types.js'

export const chakraUiAuthSkill: Skill = {
  id: 'chakra-ui-auth',
  name: 'Custom Auth System',
  description: 'Custom authentication context, hooks, and types for login, registration, and password reset.',

  render(_ctx: SkillContext): string {
    return `## Custom Auth System — Authentication Context & Hooks

> **RULE: Use the local AuthProvider and useAuth hook for all auth functionality.**
> Auth components and pages are custom implementations in \`src/features/auth/\`.

### Imports

\`\`\`tsx
import { useAuth } from '@/features/auth/hooks/use-auth'
import type { AuthUser } from '@/features/auth/types'
\`\`\`

### useAuth() Hook

Returns auth state and actions. Use this everywhere — never manage auth state manually.

\`\`\`tsx
const { user, isAuthenticated, isLoading, error, login, logout } = useAuth()
\`\`\`

| Field | Type | Description |
|-------|------|-------------|
| \`user\` | \`AuthUser \\| null\` | Current authenticated user (\`email\`, \`displayName\`, …) |
| \`isAuthenticated\` | \`boolean\` | Whether the user is logged in |
| \`isLoading\` | \`boolean\` | Auth state is being resolved |
| \`error\` | \`AuthError \\| null\` | Last auth error (\`error.message\` for display) |
| \`login\` | \`(email, password) => Promise<{ success }>\` | Log in |
| \`register\` | \`(email, password, displayName?) => Promise<{ success }>\` | Register |
| \`logout\` | \`() => Promise\` | Log out |
| \`sendPasswordResetEmail\` | \`(email) => Promise\` | Request password reset |
| \`confirmPasswordReset\` | \`(token, newPassword) => Promise<{ success }>\` | Set new password |

### Usage Examples

**Conditionally render based on auth:**
\`\`\`tsx
import { Text } from '@chakra-ui/react'
import { useAuth } from '@/features/auth/hooks/use-auth'

function UserGreeting() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Text color="fg.muted">Please log in.</Text>
  return <Text>Welcome, {user?.displayName || user?.email}</Text>
}
\`\`\`

**Protected action:**
\`\`\`tsx
function LogoutButton() {
  const { logout } = useAuth()

  return <Button onClick={logout} variant="ghost">Sign out</Button>
}
\`\`\`

**Login form integration:**
\`\`\`tsx
import { useAuth } from '@/features/auth/hooks/use-auth'

function useLoginForm() {
  const { login, error } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (data: { email: string; password: string }) => {
    const result = await login(data.email, data.password)
    if (result.success) navigate(Path.Dashboard)
  }

  return { onSubmit, error }
}
\`\`\`

### Auth Provider Setup

\`AuthProvider\` wraps the router (inside the UI \`Provider\`) and manages token storage and session lifecycle:

\`\`\`tsx
// app.tsx
import { Provider } from '@/shared/components/ui/provider'
import { AuthProvider } from '@/features/auth/components/auth-provider'

function App() {
  return (
    <Provider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  )
}
\`\`\`

### Auth Pages

Pre-built pages in \`src/features/auth/pages/\`:
- \`LoginPage\` — email/password login
- \`RegisterPage\` — registration with email, password, display name
- \`ForgotPasswordPage\` — password reset email request
- \`ResetPasswordPage\` — set new password form

Every page renders inside \`AuthPanel\` (\`src/features/auth/components/auth-panel.tsx\`), which owns the centered heading, error/success \`StatusAlert\`s and footer links. New auth screens (e.g. 2FA, email verification) should reuse it:

\`\`\`tsx
<AuthPanel
  title="Verify your email"
  description="Enter the code we sent you."
  error={error?.message}
  footer={<RouterLink to={Path.Login}>Back to log in</RouterLink>}
>
  <form onSubmit={handleSubmit}>
    <Stack gap="4">
      <Field.Root required>
        <Field.Label>Code</Field.Label>
        <Input autoComplete="one-time-code" />
      </Field.Root>
      <Button type="submit" size="lg" w="full" loading={isSubmitting}>Continue</Button>
    </Stack>
  </form>
</AuthPanel>
\`\`\`

The pages sit in \`AuthLayoutWrapper\` (\`src/router/layouts/auth-layout.tsx\`): a minimal centered column with the logo, color mode toggle and legal links.

### Rules
- NEVER manage auth state manually — always use \`useAuth()\`
- Use the \`Path\` enum for auth route paths (\`Path.Login\`, \`Path.Register\`, etc.)
- Auth adapter (backend JWT) lives in \`src/features/auth/adapter.ts\`
`
  },
}
