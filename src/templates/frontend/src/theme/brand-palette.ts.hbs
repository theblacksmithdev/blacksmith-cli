import { defineSemanticTokens } from '@chakra-ui/react'
import type { AccentPalette } from './presets'

const PALETTE_KEYS = [
  'solid',
  'contrast',
  'fg',
  'subtle',
  'muted',
  'emphasized',
  'focusRing',
  'border',
] as const

/**
 * Monochrome palette: ink-black actions in light mode, white in dark mode.
 */
const mono = defineSemanticTokens.colors({
  solid: { value: { _light: '{colors.black}', _dark: '{colors.white}' } },
  contrast: { value: { _light: '{colors.white}', _dark: '{colors.black}' } },
  fg: { value: { _light: '{colors.black}', _dark: '{colors.white}' } },
  subtle: { value: { _light: '{colors.gray.100}', _dark: '{colors.gray.900}' } },
  muted: { value: { _light: '{colors.gray.200}', _dark: '{colors.gray.800}' } },
  emphasized: { value: { _light: '{colors.gray.300}', _dark: '{colors.gray.700}' } },
  focusRing: { value: { _light: '{colors.gray.500}', _dark: '{colors.gray.400}' } },
  border: { value: '{colors.border.emphasized}' },
})

/**
 * Builds the `brand` color palette every component uses by default.
 * Accent presets alias Chakra's built-in palettes; `mono` is hand-tuned.
 */
export function brandPalette(accent: AccentPalette) {
  if (accent === 'mono') return mono

  return Object.fromEntries(
    PALETTE_KEYS.map((key) => [key, { value: `{colors.${accent}.${key}}` }]),
  )
}
