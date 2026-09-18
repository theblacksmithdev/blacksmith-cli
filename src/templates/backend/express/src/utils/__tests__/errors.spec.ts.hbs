/**
 * These bodies are parsed by `parseApiError` in the React app, so their shape
 * is part of the API contract rather than an implementation detail.
 */

import { describe, expect, it } from 'vitest'
import { ApiError } from '../errors.js'

describe('ApiError', () => {
  it('builds a { detail } body', () => {
    const error = ApiError.notFound()

    expect(error.status).toBe(404)
    expect(error.body).toEqual({ detail: 'Not found.' })
  })

  it('builds per-field validation bodies', () => {
    const error = ApiError.validation({ email: ['This field is required.'] })

    expect(error.status).toBe(400)
    expect(error.body).toEqual({ email: ['This field is required.'] })
  })

  it('builds non_field_errors for validation not tied to a field', () => {
    const error = ApiError.nonField('Invalid email or password.')

    expect(error.status).toBe(400)
    expect(error.body).toEqual({ non_field_errors: ['Invalid email or password.'] })
  })

  it('uses DRF wording for an unauthenticated request', () => {
    expect(ApiError.unauthorized().body).toEqual({
      detail: 'Authentication credentials were not provided.',
    })
  })
})
