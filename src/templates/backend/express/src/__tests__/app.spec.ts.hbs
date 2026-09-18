import { describe, expect, it } from 'vitest'
import { api } from './test-utils.js'

describe('app', () => {
  it('serves the OpenAPI schema at the same path Django does', async () => {
    const response = await api().get('/api/schema/')

    expect(response.status).toBe(200)
    expect(response.body.openapi).toBe('3.1.0')
    expect(response.body.paths).toHaveProperty('/api/auth/login/')
  })

  it('returns a DRF-shaped 404 for an unknown route', async () => {
    const response = await api().get('/api/nope/')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ detail: 'Not found.' })
  })
})
