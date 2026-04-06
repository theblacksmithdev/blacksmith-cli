import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

/**
 * Blacksmith Studio — OpenAI-style theme
 *
 * Clean, neutral, warm dark palette. No saturated brand color —
 * the UI stays out of the way and lets the content speak.
 * Accent is a soft warm white/green for interactive elements, not a brand hue.
 */

const config = defineConfig({
  globalCss: {
    body: {
      bg: '#212121',
      color: '#ececec',
      fontFamily: "'Söhne', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      letterSpacing: '-0.01em',
    },
    '*': {
      borderColor: 'rgba(255,255,255,0.08)',
    },
    '*::-webkit-scrollbar': {
      width: '6px',
      height: '6px',
    },
    '*::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '*::-webkit-scrollbar-thumb': {
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '3px',
    },
    '*::-webkit-scrollbar-thumb:hover': {
      background: 'rgba(255,255,255,0.18)',
    },
    '::selection': {
      background: 'rgba(255,255,255,0.15)',
      color: '#ececec',
    },
  },
})

export const system = createSystem(defaultConfig, config)

/*
 * Color reference — OpenAI-style palette:
 *
 * Backgrounds:
 *   --bg-main:      #212121    (body / main chat area)
 *   --bg-sidebar:   #171717    (sidebar)
 *   --bg-surface:   #2f2f2f    (input bar, cards, elevated surfaces)
 *   --bg-hover:     #3a3a3a    (hover states)
 *   --bg-hover-light: #424242  (stronger hover)
 *
 * Borders:
 *   --border:       rgba(255,255,255,0.08)
 *   --border-hover: rgba(255,255,255,0.15)
 *
 * Text:
 *   --text-primary:   #ececec
 *   --text-secondary: #b4b4b4
 *   --text-tertiary:  #8e8e8e
 *   --text-muted:     #676767
 *
 * Accent (minimal — just for interactive states):
 *   --accent:         #ececec    (white as accent, like OpenAI)
 *   --accent-hover:   #ffffff
 *   --accent-green:   #10a37f    (OpenAI green, used sparingly)
 *   --accent-green-subtle: rgba(16,163,127,0.15)
 *
 * Semantic:
 *   --success: #10a37f
 *   --error:   #ef4444
 *   --warning: #f59e0b
 */
