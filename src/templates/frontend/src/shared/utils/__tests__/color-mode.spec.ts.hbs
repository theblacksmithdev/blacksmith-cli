import { applyColorMode, getColorMode, setColorMode, subscribeColorMode } from '../color-mode'

function mockSystemDark(dark: boolean) {
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    matches: dark,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }) as unknown as MediaQueryList)
}

describe('color mode', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    mockSystemDark(false)
  })

  it('follows the OS when the user has not chosen', () => {
    mockSystemDark(true)

    expect(getColorMode()).toBe('dark')
  })

  it('prefers a stored choice over the OS', () => {
    mockSystemDark(true)
    setColorMode('light')

    expect(getColorMode()).toBe('light')
  })

  it('puts the mode class on <html>', () => {
    setColorMode('dark')

    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement).not.toHaveClass('light')
  })

  it('notifies subscribers when the mode changes', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeColorMode(listener)

    applyColorMode()
    unsubscribe()
    applyColorMode()

    expect(listener).toHaveBeenCalledTimes(1)
  })
})
