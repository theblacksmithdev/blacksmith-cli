import type { Skill, SkillContext } from './types.js'

export const vueAuthSkill: Skill = {
  id: 'vue-auth',
  name: 'Custom Auth System',
  description: 'Authentication with the Pinia auth store, the useAuth composable, the router guard, and the auth pages for login, registration, and password reset.',

  render(_ctx: SkillContext): string {
    return `## Custom Auth System — Store, Composable & Guard

> **RULE: Use the \`useAuth()\` composable for all auth state and actions.**
> Auth lives in \`src/features/auth/\`. Never read tokens, call the auth endpoints, or track "logged in" yourself.

### The Layers

| File | Role |
|------|------|
| \`adapter.ts\` | Talks to the backend's JWT endpoints, keeps the session in module state, restores it on reload (shared with the React frontend) |
| \`types.ts\` | \`AuthUser\`, \`AuthError\`, \`AuthResult\`, \`ApiUser\`, \`TokenPair\` |
| \`stores/auth-store.ts\` | Pinia setup store over the adapter: \`user\`, \`loading\`, \`error\`, \`isAuthenticated\`, \`whenReady()\`, actions |
| \`composables/use-auth.ts\` | The one import path components use |
| \`schemas.ts\` | Zod schemas for the auth forms |
| \`components/AuthPanel.vue\` | The frame every auth page renders in |
| \`pages/*.vue\` | Login, register, forgot and reset password |
| \`routes.ts\` | The auth routes (lazy-loaded pages) |

Tokens are stored by \`src/api/token-storage.ts\`; \`src/api/client.ts\` adds the bearer header to every generated request, renews an expired access token once, and signs the user out when the refresh fails.

### Imports

\`\`\`ts
import { useAuth } from '@/features/auth/composables/use-auth'
import type { AuthUser } from '@/features/auth/types'
\`\`\`

### useAuth()

\`\`\`ts
const { user, isAuthenticated, isLoading, error, login, logout } = useAuth()
\`\`\`

| Field | Type | Description |
|-------|------|-------------|
| \`user\` | \`Ref<AuthUser \\| null>\` | Current user (\`email\`, \`displayName\`, …) |
| \`isAuthenticated\` | \`Ref<boolean>\` | Whether a user is signed in |
| \`isLoading\` | \`Ref<boolean>\` | True until the stored session has been checked |
| \`error\` | \`Ref<AuthError \\| null>\` | Last auth error (\`error.message\` for display) |
| \`login\` | \`(email, password) => Promise<AuthResult>\` | Sign in |
| \`register\` | \`(email, password, displayName?) => Promise<AuthResult>\` | Create an account and sign in |
| \`logout\` | \`() => Promise<void>\` | Sign out (the backend revokes the refresh token) |
| \`sendPasswordResetEmail\` | \`(email) => Promise<{ success, error? }>\` | Request a reset link |
| \`confirmPasswordReset\` | \`(token, newPassword) => Promise<{ success, error? }>\` | Set a new password |

The values are refs from \`storeToRefs\`, so destructuring keeps them reactive. In \`<script setup>\` they unwrap in the template (\`user?.email\`); in script code read \`.value\` (\`user.value?.email\`).

### Usage Examples

**Render by auth state:**
\`\`\`vue
<script setup lang="ts">
import { useAuth } from '@/features/auth/composables/use-auth'

const { user, isAuthenticated } = useAuth()
</script>

<template>
  <p v-if="!isAuthenticated" class="text-muted">
    Please log in.
  </p>
  <p v-else>
    Welcome, {{ user?.displayName || user?.email }}
  </p>
</template>
\`\`\`

**Sign out, then leave:**
\`\`\`ts
const { logout } = useAuth()
const router = useRouter()

async function handleLogout() {
  await logout()
  await router.push(Path.Login)
}
\`\`\`

**A sign-in form's submit:**
\`\`\`ts
const { login, error } = useAuth()
const submitting = ref(false)

async function onSubmit(event: FormSubmitEvent<z.output<typeof loginSchema>>) {
  submitting.value = true
  try {
    const result = await login(event.data.email, event.data.password)
    if (result.success) await router.replace(Path.Dashboard)
  } finally {
    submitting.value = false
  }
}
\`\`\`

\`error\` is set by the store when an action fails; pass \`error?.message\` to \`AuthPanel\`.

### Protecting Routes

Private pages are protected by **route meta**, not by wrapping components. \`src/router/routes.ts\` puts them under a group with \`meta: { requiresAuth: true }\`:

\`\`\`ts
const privateRoutes: RouteRecordRaw[] = [
  ...dashboardRoutes,
  // blacksmith:routes
]

// inside the MainLayout route's children
{ path: '', meta: { requiresAuth: true }, children: privateRoutes },
\`\`\`

\`installAuthGuard\` in \`src/router/guards.ts\` runs before every navigation into a \`requiresAuth\` route. It **awaits \`auth.whenReady()\`** — the stored session is restored asynchronously, and checking before then would bounce a signed-in user to the login page on every hard refresh. A signed-out visitor goes to \`Path.Login\` with \`?redirect=<the page>\`; \`LoginPage\` returns there after sign-in.

- Add a private page by spreading its routes into \`privateRoutes\` (\`make:resource\` does this at \`// blacksmith:routes\`)
- \`RouteMeta\` is typed in \`src/router/route-meta.ts\` — add new meta fields (e.g. \`roles\`) there, and check them in the same guard
- Never check \`isAuthenticated\` in a page's \`onMounted\` to redirect — that is the guard's job

### Setup

\`src/plugins.ts\` installs Pinia **before** the router, because the guard reads the auth store:

\`\`\`ts
app.use(pinia)
app.use(router)
app.use(VueQueryPlugin, { queryClient })
app.use(ui)
\`\`\`

The store creates the adapter on first use, so nothing needs a provider component.

### Auth Pages

In \`src/features/auth/pages/\`, lazy-loaded from \`routes.ts\` inside \`AuthLayout\` (\`src/router/layouts/AuthLayout.vue\`: logo, colour mode toggle, legal links):
- \`LoginPage.vue\` — email and password; honours \`?redirect=\`
- \`RegisterPage.vue\` — name, email, password
- \`ForgotPasswordPage.vue\` — requests a reset link and shows a notice
- \`ResetPasswordPage.vue\` — \`token\` arrives as a prop (\`props: true\` on the \`/reset-password/:token\` route)

Each page is a \`UForm\` with a schema from \`schemas.ts\`, inside \`AuthPanel\`. New auth screens (2FA, email verification) reuse it:

\`\`\`vue
<template>
  <AuthPanel title="Verify your email" description="Enter the code we sent you." :error="error?.message">
    <UForm :schema="verifySchema" :state="state" class="flex flex-col gap-4" @submit="onSubmit">
      <UFormField label="Code" name="code" required>
        <UInput v-model="state.code" autocomplete="one-time-code" size="lg" class="w-full" />
      </UFormField>

      <UButton type="submit" size="lg" block :loading="submitting">
        Continue
      </UButton>
    </UForm>

    <template #footer>
      <TextLink :to="Path.Login">
        Back to log in
      </TextLink>
    </template>
  </AuthPanel>
</template>
\`\`\`

\`AuthPanel\` props: \`title\`, \`description\`, \`error\`, \`notice\` (a success message); slots: default (the form) and \`#footer\` (secondary links).

### Testing Auth

- \`renderWithProviders\` gives each test a fresh Pinia, so the store starts signed out
- The adapter keeps the session in module state: tests that restore a session call \`vi.resetModules()\` and import the guard or store dynamically (see \`src/router/__tests__/guards.spec.ts\`)
- Stub \`fetch\` with \`vi.stubGlobal\` for \`/api/auth/me/\` and seed tokens with \`setTokens\` from \`@/api/token-storage\`

### Rules
- NEVER manage auth state manually — always \`useAuth()\`
- NEVER import the store into components; \`useAuth()\` is the public API (the guard is the one exception)
- Use the \`Path\` enum for auth routes (\`Path.Login\`, \`Path.Register\`, …)
- The adapter is shared with the React frontend — change backend auth calls there, once
`
  },
}
