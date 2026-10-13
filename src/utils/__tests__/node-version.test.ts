import { describe, it, expect } from 'vitest'
import { describeNodeFloors, meetsNodeFloors, parseNodeVersion } from '../node-version.js'

const VUE_FLOORS = [
  { major: 20, minor: 19 },
  { major: 22, minor: 12 },
]

describe('node versions', () => {
  it('parses `node --version` output', () => {
    expect(parseNodeVersion('v20.19.1\n')).toEqual({ major: 20, minor: 19 })
    expect(parseNodeVersion('not a version')).toBeNull()
  })

  it.each([
    ['20.19', true],
    ['20.20', true],
    ['22.12', true],
    ['24.0', true],
    ['20.10', false],
    ['21.7', false],
    ['22.11', false],
    ['18.20', false],
  ])('reads %s against ^20.19 || >=22.12 as %s', (version, expected) => {
    expect(meetsNodeFloors(parseNodeVersion(version)!, VUE_FLOORS)).toBe(expected)
  })

  it('describes the floors', () => {
    expect(describeNodeFloors(VUE_FLOORS)).toBe('20.19+ or 22.12+')
  })
})
