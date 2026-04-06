import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  globalCss: {
    body: {
      bg: '#0a0a0f',
      color: '#f0f0f5',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      letterSpacing: '-0.01em',
    },
    '*': {
      borderColor: 'rgba(255,255,255,0.06)',
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
      background: 'rgba(255,255,255,0.14)',
    },
    '::selection': {
      background: 'rgba(99,102,241,0.3)',
      color: '#f0f0f5',
    },
  },
})

export const system = createSystem(defaultConfig, config)
