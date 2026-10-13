import { describe, it, expect } from 'vitest'
import { wantsUiSkill } from '../cli-options.js'

describe('wantsUiSkill', () => {
  it('includes the UI kit skills by default', () => {
    expect(wantsUiSkill({})).toBe(true)
  })

  it('leaves them out for --no-ui-skill', () => {
    expect(wantsUiSkill({ uiSkill: false })).toBe(false)
  })

  it('still honours the old --no-chakra-ui-skill', () => {
    expect(wantsUiSkill({ uiSkill: true, chakraUiSkill: false })).toBe(false)
  })
})
