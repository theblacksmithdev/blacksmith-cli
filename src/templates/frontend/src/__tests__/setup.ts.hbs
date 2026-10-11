import '@testing-library/jest-dom/vitest'

// Mock window.matchMedia (not implemented in jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// jsdom can't parse the CSS cascade layers Chakra UI v3 emits; the styles
// still apply, so drop that one noisy error and keep every other one.
const consoleError = console.error
console.error = (...args: unknown[]) => {
  if (String(args[0]).includes('Could not parse CSS stylesheet')) return
  consoleError(...args)
}

// Clean up after each test
afterEach(() => {
  document.body.innerHTML = ''
})
