import { describe, it, expect } from 'vitest'
import { parseJavaVersion } from '../java.js'

describe('parseJavaVersion', () => {
  it('reads the major version from a modern JDK', () => {
    expect(parseJavaVersion('openjdk version "21.0.2" 2024-01-16')).toBe(21)
    expect(parseJavaVersion('java version "17.0.12" 2024-07-16 LTS')).toBe(17)
  })

  it('reads a bare major version', () => {
    expect(parseJavaVersion('openjdk version "22" 2024-03-19')).toBe(22)
  })

  it('reads the old 1.x form as its minor number', () => {
    expect(parseJavaVersion('java version "1.8.0_292"')).toBe(8)
  })

  it('returns null for output that is not a version', () => {
    expect(parseJavaVersion('The operation couldn’t be completed. Unable to locate a Java Runtime.')).toBeNull()
  })
})
