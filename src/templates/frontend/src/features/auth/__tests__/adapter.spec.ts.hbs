import { getAccessToken, getRefreshToken, setTokens } from '@/api/token-storage'

const me = { id: 1, email: 'ada@example.com', first_name: 'Ada', last_name: '' }

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Route fetch calls by URL path; each entry is consumed in order. */
function mockFetch(routes: Record<string, Response[]>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const path = new URL(String(input)).pathname
    const next = routes[path]?.shift()
    if (!next) throw new Error(`Unexpected request to ${path}`)
    return next
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** Load a fresh adapter (module state included) and wait for its first auth state. */
async function restoredUser() {
  vi.resetModules()
  const { createAuthAdapter } = await import('../adapter')
  const adapter = createAuthAdapter()
  return new Promise((resolve) => adapter.onAuthStateChanged(resolve))
}

describe('auth adapter session restore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('restores the user from stored tokens after a reload', async () => {
    setTokens('access-1', 'refresh-1')
    mockFetch({ '/api/auth/me/': [jsonResponse(200, me)] })

    const user = await restoredUser()

    expect(user).toMatchObject({ email: 'ada@example.com', displayName: 'Ada' })
  })

  it('renews an expired access token before giving up', async () => {
    setTokens('expired', 'refresh-1')
    mockFetch({
      '/api/auth/me/': [jsonResponse(401, { detail: 'expired' }), jsonResponse(200, me)],
      '/api/auth/refresh/': [jsonResponse(200, { access: 'access-2', refresh: 'refresh-2' })],
    })

    const user = await restoredUser()

    expect(user).toMatchObject({ email: 'ada@example.com' })
    expect(getAccessToken()).toBe('access-2')
    expect(getRefreshToken()).toBe('refresh-2')
  })

  it('signs out and clears tokens when the refresh token is rejected', async () => {
    setTokens('expired', 'revoked')
    mockFetch({
      '/api/auth/me/': [jsonResponse(401, { detail: 'expired' })],
      '/api/auth/refresh/': [jsonResponse(401, { detail: 'invalid' })],
    })

    const user = await restoredUser()

    expect(user).toBeNull()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('reports signed out without calling the API when nothing is stored', async () => {
    const fetchMock = mockFetch({})

    const user = await restoredUser()

    expect(user).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
