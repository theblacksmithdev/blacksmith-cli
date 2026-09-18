import { Path, buildPath } from '../paths'

describe('buildPath', () => {
  it('returns a static path unchanged', () => {
    expect(buildPath(Path.Dashboard)).toBe('/dashboard')
  })

  it('substitutes a named parameter', () => {
    expect(buildPath(Path.ResetPassword, { token: 'abc123' })).toBe(
      '/reset-password/abc123'
    )
  })

  it('encodes parameter values', () => {
    expect(buildPath(Path.ResetPassword, { token: 'a b/c' })).toBe(
      '/reset-password/a%20b%2Fc'
    )
  })

  it('leaves unmatched placeholders alone', () => {
    expect(buildPath(Path.ResetPassword, { other: 'x' })).toBe('/reset-password/:token')
  })
})
