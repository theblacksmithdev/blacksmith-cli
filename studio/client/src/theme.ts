import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {},
    },
  },
  globalCss: {
    body: {
      bg: 'gray.900',
      color: 'gray.100',
    },
  },
})

export const system = createSystem(defaultConfig, config)
