import type { Skill, SkillContext } from './types.js'

export const chakraUiAuthSkill: Skill = {
  id: 'chakra-ui-auth',
  name: 'Custom Auth System',
  description: 'Custom authentication context, hooks, and types for login, registration, and password reset.',

  render(_ctx: SkillContext): string {
    return `## Custom Auth System — Authentication Context & Hooks

> **RULE: Use the local AuthProvider and useAuth hook for all auth functionality.**
> Auth components (LoginForm, RegisterForm, etc.) are custom implementations in \`frontend/src/features/auth/\`.

\`\`\`tsx
import { AuthProvider } from '@/features/auth/context'
import { useAuth } from '@/features/auth/hooks/use-auth'
import type { User, AuthState } from '@/features/auth/types'
\`\`\`

### Context & Provider

- \`AuthProvider\` — Context provider wrapping the app. Manages auth state, token storage, and session lifecycle.
  - Place at the app root, inside \`ChakraProvider\`.
  - Props: \`config?: { adapter?: AuthAdapter }\`

### Types

\`\`\`tsx
interface User {
  id: string
  email: string
  displayName?: string
  avatar?: string
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}
\`\`\`

### Hooks

- \`useAuth()\` — Hook for auth state and actions
  - Returns: \`user\`, \`loading\`, \`error\`, \`isAuthenticated\`, \`signInWithEmail(email, password)\`, \`signUpWithEmail(email, password, displayName?)\`, \`signOut()\`, \`sendPasswordResetEmail(email)\`, \`confirmPasswordReset(code, newPassword)\`

### Auth Pages

Auth pages are custom implementations in \`frontend/src/features/auth/pages/\`:

- \`LoginPage\` — Login form with email/password, validation, and navigation links
- \`RegisterPage\` — Registration form with email, password, and display name
- \`ForgotPasswordPage\` — Password reset email request
- \`ResetPasswordPage\` — Set new password form

Each auth page uses Chakra UI form components (\`FormControl\`, \`FormLabel\`, \`Input\`, \`Button\`, etc.) with React Hook Form + Zod validation.

### Adapter

- \`AuthAdapter\` — Interface for custom auth backends (Django JWT adapter in \`frontend/src/features/auth/adapter.ts\`)

### Rules
- NEVER manage auth state manually. Use \`useAuth()\` hook.
- Auth pages live in \`frontend/src/features/auth/pages/\` and use Chakra UI components.
- Use the \`Path\` enum for auth route paths (\`Path.Login\`, \`Path.Register\`, etc.).
`
  },
}
