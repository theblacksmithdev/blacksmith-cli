/**
 * Browser APIs jsdom lacks, so components render in tests as in a browser.
 * Loaded by setup.ts.
 */

// window.matchMedia (color mode reads the OS preference)
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

// ResizeObserver (overlays and menus measure themselves)
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jsdom can't parse the CSS cascade layers the UI kit emits; the styles
// still apply, so drop that one noisy error and keep every other one.
const consoleError = console.error
console.error = (...args: unknown[]) => {
  if (String(args[0]).includes('Could not parse CSS stylesheet')) return
  consoleError(...args)
}
