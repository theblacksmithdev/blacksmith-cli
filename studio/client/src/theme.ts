import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

/**
 * Blacksmith Studio Design Tokens
 *
 * Brand: Warm, craft-oriented palette — think premium dev tooling, not AI chatbot.
 * Accent: Teal/cyan (#0d9488 → #14b8a6) — professional, distinctive, not the typical AI purple.
 * Surfaces: Warm dark neutrals with slight blue undertone for depth.
 */

const config = defineConfig({
  globalCss: {
    body: {
      bg: '#0c0c0e',
      color: '#e8e8ed',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      letterSpacing: '-0.01em',
    },
    '*': {
      borderColor: 'rgba(255,255,255,0.07)',
    },
    '*::-webkit-scrollbar': {
      width: '6px',
      height: '6px',
    },
    '*::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '*::-webkit-scrollbar-thumb': {
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '3px',
    },
    '*::-webkit-scrollbar-thumb:hover': {
      background: 'rgba(255,255,255,0.15)',
    },
    '::selection': {
      background: 'rgba(20,184,166,0.25)',
      color: '#e8e8ed',
    },
  },
})

export const system = createSystem(defaultConfig, config)

/*
 * Color reference (use in css props across components):
 *
 * Backgrounds:
 *   --bg-deep:      #0c0c0e    (body/deepest)
 *   --bg-surface:   #141416    (cards, panels)
 *   --bg-elevated:  #1c1c20    (hover states, elevated surfaces)
 *   --bg-muted:     #24242a    (input fields, recessed areas)
 *
 * Borders:
 *   --border:       rgba(255,255,255,0.07)
 *   --border-hover: rgba(255,255,255,0.13)
 *
 * Text:
 *   --text-primary:   #e8e8ed
 *   --text-secondary: #85858f
 *   --text-tertiary:  #55555f
 *
 * Brand accent (teal):
 *   --accent:         #0d9488
 *   --accent-light:   #14b8a6
 *   --accent-subtle:  rgba(13,148,136,0.15)
 *   --accent-glow:    rgba(13,148,136,0.25)
 *
 * Semantic:
 *   --success: #22c55e
 *   --error:   #ef4444
 *   --warning: #eab308
 */
