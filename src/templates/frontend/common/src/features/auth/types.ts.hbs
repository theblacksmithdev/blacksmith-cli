export interface AuthUser {
  id: string
  email: string
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  providerId: string
}

export interface AuthError {
  code: string
  message: string
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  error?: AuthError
}

export type SocialProvider = 'google' | 'github' | 'facebook' | 'apple'

/** The user as `/api/auth/me/` returns it. */
export interface ApiUser {
  id: number | string
  email: string
  first_name?: string
  last_name?: string
}

/** The token pair login and register return. */
export interface TokenPair {
  access: string
  refresh: string
}

export interface AuthAdapter {
  signInWithEmail(email: string, password: string): Promise<AuthResult>
  signUpWithEmail(email: string, password: string, displayName?: string): Promise<AuthResult>
  signInWithSocial(provider: SocialProvider): Promise<AuthResult>
  sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: AuthError }>
  confirmPasswordReset(code: string, newPassword: string): Promise<{ success: boolean; error?: AuthError }>
  signOut(): Promise<void>
  getCurrentUser(): AuthUser | null
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void
}
