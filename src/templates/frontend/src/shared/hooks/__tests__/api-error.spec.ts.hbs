import { parseApiError, getErrorMessage } from '../api-error'

describe('parseApiError', () => {
  it('parses a DRF detail error', () => {
    const result = parseApiError({ status: 404, error: { detail: 'Not found.' } })

    expect(result.status).toBe(404)
    expect(result.message).toBe('Not found.')
    expect(result.fieldErrors).toEqual({})
  })

  it('parses non_field_errors as a general message', () => {
    const result = parseApiError({
      status: 400,
      error: { non_field_errors: ['Invalid email or password.'] },
    })

    expect(result.message).toBe('Invalid email or password.')
  })

  it('collects field errors', () => {
    const result = parseApiError({
      status: 400,
      error: { title: ['This field is required.'], description: ['Too long.'] },
    })

    expect(result.fieldErrors.title).toEqual(['This field is required.'])
    expect(result.fieldErrors.description).toEqual(['Too long.'])
    expect(result.message).toBe('Please fix the errors below.')
  })

  it('unwraps DRF error objects that carry a message', () => {
    const result = parseApiError({
      status: 400,
      error: { email: [{ message: 'Already taken.', code: 'unique' }] },
    })

    expect(result.fieldErrors.email).toEqual(['Already taken.'])
  })

  it('falls back to a friendly message for a bare status', () => {
    const result = parseApiError({ status: 500 })

    expect(result.message).toBe('Something went wrong on our end. Please try again later.')
  })

  it('handles a string body', () => {
    const result = parseApiError({ status: 400, error: 'Something broke.' })

    expect(result.message).toBe('Something broke.')
  })

  it('handles an unknown error shape', () => {
    const result = parseApiError(null)

    expect(result.status).toBe(0)
    expect(result.message).toBe('An unexpected error occurred.')
  })
})

describe('getErrorMessage', () => {
  it('returns just the message', () => {
    expect(getErrorMessage({ status: 401, error: { detail: 'Sign in required.' } })).toBe(
      'Sign in required.'
    )
  })
})
