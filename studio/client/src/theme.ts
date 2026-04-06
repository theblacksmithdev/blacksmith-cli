import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

/**
 * Blacksmith Studio — Light & Dark theme via CSS custom properties.
 *
 * All colors are referenced as var(--studio-*) across components.
 * Toggle by adding/removing `class="dark"` on <html>.
 */

const config = defineConfig({
  globalCss: {
    ':root': {
      /* ── Light mode (default) ── */
      '--studio-bg-main': '#ffffff',
      '--studio-bg-sidebar': '#f5f5f5',
      '--studio-bg-surface': '#f0f0f0',
      '--studio-bg-hover': '#e8e8e8',
      '--studio-bg-hover-strong': '#e0e0e0',
      '--studio-bg-inset': '#fafafa',

      '--studio-border': 'rgba(0,0,0,0.08)',
      '--studio-border-hover': 'rgba(0,0,0,0.15)',

      '--studio-text-primary': '#0d0d0d',
      '--studio-text-secondary': '#6e6e6e',
      '--studio-text-tertiary': '#999999',
      '--studio-text-muted': '#b0b0b0',

      '--studio-accent': '#0d0d0d',
      '--studio-accent-fg': '#ffffff',
      '--studio-green': '#10a37f',
      '--studio-green-subtle': 'rgba(16,163,127,0.1)',

      '--studio-error': '#ef4444',
      '--studio-warning': '#f59e0b',
      '--studio-link': '#2563eb',

      '--studio-code-bg': '#f5f5f5',
      '--studio-code-border': 'rgba(0,0,0,0.06)',

      '--studio-scrollbar': 'rgba(0,0,0,0.08)',
      '--studio-scrollbar-hover': 'rgba(0,0,0,0.15)',
      '--studio-selection': 'rgba(0,0,0,0.08)',

      '--studio-shadow': '0 2px 8px rgba(0,0,0,0.08)',
    },

    '.dark': {
      /* ── Dark mode ── */
      '--studio-bg-main': '#212121',
      '--studio-bg-sidebar': '#171717',
      '--studio-bg-surface': '#2f2f2f',
      '--studio-bg-hover': '#3a3a3a',
      '--studio-bg-hover-strong': '#424242',
      '--studio-bg-inset': '#1a1a1a',

      '--studio-border': 'rgba(255,255,255,0.08)',
      '--studio-border-hover': 'rgba(255,255,255,0.15)',

      '--studio-text-primary': '#ececec',
      '--studio-text-secondary': '#b4b4b4',
      '--studio-text-tertiary': '#8e8e8e',
      '--studio-text-muted': '#676767',

      '--studio-accent': '#ececec',
      '--studio-accent-fg': '#212121',
      '--studio-green': '#10a37f',
      '--studio-green-subtle': 'rgba(16,163,127,0.15)',

      '--studio-error': '#ef4444',
      '--studio-warning': '#f59e0b',
      '--studio-link': '#7ab8f5',

      '--studio-code-bg': '#171717',
      '--studio-code-border': 'rgba(255,255,255,0.06)',

      '--studio-scrollbar': 'rgba(255,255,255,0.1)',
      '--studio-scrollbar-hover': 'rgba(255,255,255,0.18)',
      '--studio-selection': 'rgba(255,255,255,0.15)',

      '--studio-shadow': '0 2px 8px rgba(0,0,0,0.3)',
    },

    body: {
      bg: 'var(--studio-bg-main)',
      color: 'var(--studio-text-primary)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      letterSpacing: '-0.01em',
    },
    '*': {
      borderColor: 'var(--studio-border)',
    },
    '*::-webkit-scrollbar': { width: '6px', height: '6px' },
    '*::-webkit-scrollbar-track': { background: 'transparent' },
    '*::-webkit-scrollbar-thumb': { background: 'var(--studio-scrollbar)', borderRadius: '3px' },
    '*::-webkit-scrollbar-thumb:hover': { background: 'var(--studio-scrollbar-hover)' },
    '::selection': { background: 'var(--studio-selection)', color: 'var(--studio-text-primary)' },

    '@keyframes pickerFadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
    '@keyframes pickerSlideUp': {
      from: { opacity: 0, transform: 'translate(-50%, -47%)' },
      to: { opacity: 1, transform: 'translate(-50%, -50%)' },
    },
    '@keyframes shimmer': { '0%,100%': { opacity: 0.3 }, '50%': { opacity: 0.6 } },
    '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
    '@keyframes dotPulse': { '0%,100%': { opacity: 0.3, transform: 'scale(0.8)' }, '50%': { opacity: 1, transform: 'scale(1)' } },
  },
})

export const system = createSystem(defaultConfig, config)
