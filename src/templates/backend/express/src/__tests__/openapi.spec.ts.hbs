/**
 * The generated frontend client is derived from this document, and the hook
 * names in `src/api/hooks/` come straight from `operationId`. These assertions
 * are what stop a rename here from silently breaking the React app.
 */

import { describe, expect, it } from 'vitest'
import { buildOpenApiDocument } from '../config/openapi.js'
import '../modules/index.js'

type Operation = { operationId?: string }
type Paths = Record<string, Record<string, Operation>>

const document = buildOpenApiDocument() as unknown as { paths: Paths }

describe('OpenAPI document', () => {
  it('declares every auth endpoint with a trailing slash', () => {
    for (const path of [
      '/api/auth/login/',
      '/api/auth/register/',
      '/api/auth/me/',
      '/api/auth/change-password/',
      '/api/auth/forgot-password/',
      '/api/auth/reset-password/',
      '/api/auth/logout/',
      '/api/auth/refresh/',
    ]) {
      expect(document.paths, path).toHaveProperty([path])
    }
  })

  it('uses the operation ids drf-spectacular would emit', () => {
    expect(document.paths['/api/auth/login/'].post.operationId).toBe('auth_login_create')
    expect(document.paths['/api/auth/me/'].get.operationId).toBe('auth_me_retrieve')
    expect(document.paths['/api/auth/me/'].patch.operationId).toBe('auth_me_partial_update')
  })
})
