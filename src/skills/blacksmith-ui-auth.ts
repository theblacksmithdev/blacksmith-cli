import type { Skill, SkillContext } from './types.js'

export const blacksmithUiAuthSkill: Skill = {
  id: 'blacksmith-ui-auth',

  render(_ctx: SkillContext): string {
    return `## @blacksmith-ui/auth — Authentication UI

> **RULE: ALWAYS use these for auth pages.** Do NOT build custom login/register forms.

\`\`\`tsx
import { AuthProvider, LoginForm, RegisterForm, useAuth } from '@blacksmith-ui/auth'
\`\`\`

### Components

- \`AuthProvider\` — Context provider wrapping the app. Props: \`config: { adapter, socialProviders? }\`
- \`LoginForm\` — Complete login form with email/password fields, validation, and links
  - Props: \`onSubmit: (data: { email, password }) => void\`, \`onRegisterClick\`, \`onForgotPasswordClick\`, \`error\`, \`loading\`
- \`RegisterForm\` — Registration form with email, password, and display name
  - Props: \`onSubmit: (data: { email, password, displayName }) => void\`, \`onLoginClick\`, \`error\`, \`loading\`
- \`ForgotPasswordForm\` — Password reset email request
  - Props: \`onSubmit: (data: { email }) => void\`, \`onLoginClick\`, \`error\`, \`loading\`
- \`ResetPasswordForm\` — Set new password form
  - Props: \`onSubmit: (data: { password, code }) => void\`, \`code\`, \`onLoginClick\`, \`error\`, \`loading\`

### Hooks

- \`useAuth\` — Hook for auth state and actions
  - Returns: \`user\`, \`loading\`, \`error\`, \`signInWithEmail(email, password)\`, \`signUpWithEmail(email, password, displayName?)\`, \`signOut()\`, \`sendPasswordResetEmail(email)\`, \`confirmPasswordReset(code, newPassword)\`, \`socialProviders\`

### Adapter

- \`AuthAdapter\` — Interface for custom auth backends (Django JWT adapter already configured in \`frontend/src/features/auth/adapter.ts\`)

### Rules
- NEVER build custom login/register forms. Use \`LoginForm\`, \`RegisterForm\`, etc. from \`@blacksmith-ui/auth\`.
- NEVER manage auth state manually. Use \`useAuth\` hook.
`
  },
}
