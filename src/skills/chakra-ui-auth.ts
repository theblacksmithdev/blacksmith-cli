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
import type { User } from '@/features/auth/types'
\`\`\`

### useAuth() Hook

Returns auth state and actions. Use this everywhere — never manage auth state manually.

\`\`\`tsx
const { user, isAuthenticated, loading, error, signInWithEmail, signOut } = useAuth()
\`\`\`

| Field | Type | Description |
|-------|------|-------------|
| \`user\` | \`User \\| null\` | Current authenticated user |
| \`isAuthenticated\` | \`boolean\` | Whether the user is logged in |
| \`loading\` | \`boolean\` | Auth state is being resolved |
| \`error\` | \`string \\| null\` | Last auth error message |
| \`signInWithEmail\` | \`(email, password) => Promise\` | Log in |
| \`signUpWithEmail\` | \`(email, password, displayName?) => Promise\` | Register |
| \`signOut\` | \`() => Promise\` | Log out |
| \`sendPasswordResetEmail\` | \`(email) => Promise\` | Request password reset |
| \`confirmPasswordReset\` | \`(code, newPassword) => Promise\` | Set new password |

### Usage Examples

**Conditionally render based on auth:**
\`\`\`tsx
import { useAuth } from '@/features/auth/hooks/use-auth'

function UserGreeting() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Text>Please log in.</Text>
  return <Text>Welcome, {user?.email}</Text>
}
\`\`\`

**Protected action:**
\`\`\`tsx
function LogoutButton() {
  const { signOut } = useAuth()

  return <Button onClick={signOut} variant="ghost">Sign out</Button>
}
\`\`\`

**Login form integration:**
\`\`\`tsx
import { useAuth } from '@/features/auth/hooks/use-auth'

function useLoginForm() {
  const { signInWithEmail, error } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (data: { email: string; password: string }) => {
    await signInWithEmail(data.email, data.password)
    navigate(Path.Dashboard)
  }

  return { onSubmit, error }
}
\`\`\`

### Auth Provider Setup

\`AuthProvider\` wraps the app (inside \`ChakraProvider\`) and manages token storage and session lifecycle:

\`\`\`tsx
// app.tsx
import { AuthProvider } from '@/features/auth/context'

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ChakraProvider>
  )
}
\`\`\`

### Auth Pages

Pre-built pages in \`src/features/auth/pages/\`:
- \`LoginPage\` — email/password login with validation
- \`RegisterPage\` — registration with email, password, display name
- \`ForgotPasswordPage\` — password reset email request
- \`ResetPasswordPage\` — set new password form

All use Chakra UI form components with React Hook Form + Zod validation.

### Rules
- NEVER manage auth state manually — always use \`useAuth()\`
- Use the \`Path\` enum for auth route paths (\`Path.Login\`, \`Path.Register\`, etc.)
- Auth adapter (Django JWT) lives in \`src/features/auth/adapter.ts\`
`
  },
}
