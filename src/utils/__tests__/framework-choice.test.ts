import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createLoggerMock } from '../../__tests__/helpers.js'

vi.mock('../logger.js', () => createLoggerMock())

import { chooseFramework } from '../framework-choice.js'
import { log, promptSelect } from '../logger.js'

const choice = { frameworks: ['react', 'vue'], fallback: 'react', label: 'Frontend framework' }

describe('chooseFramework', () => {
  beforeEach(() => {
    vi.mocked(promptSelect).mockReset()
  })

  it('takes the flag without asking', async () => {
    expect(await chooseFramework({ ...choice, flag: 'vue', needed: true })).toBe('vue')
    expect(promptSelect).not.toHaveBeenCalled()
  })

  it('asks when the project needs one and no flag was given', async () => {
    vi.mocked(promptSelect).mockResolvedValue('vue')

    expect(await chooseFramework({ ...choice, flag: undefined, needed: true })).toBe('vue')
  })

  it('falls back rather than storing an unrecognised answer', async () => {
    vi.mocked(promptSelect).mockResolvedValue('svelte')

    expect(await chooseFramework({ ...choice, flag: undefined, needed: true })).toBe('react')
  })

  it('does not ask when the project has no such half', async () => {
    expect(await chooseFramework({ ...choice, flag: undefined, needed: false })).toBe('react')
    expect(promptSelect).not.toHaveBeenCalled()
  })

  it('rejects an unknown flag even when the half is not needed', async () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit')
    })

    await expect(chooseFramework({ ...choice, flag: 'svelte', needed: false })).rejects.toThrow('exit')
    expect(log.error).toHaveBeenCalledWith('Invalid frontend framework: "svelte". Must be one of: react, vue')
    exit.mockRestore()
  })
})
