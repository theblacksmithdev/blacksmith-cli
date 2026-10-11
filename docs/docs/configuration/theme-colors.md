---
sidebar_position: 2
---

# Theme Colors

The generated frontend uses a [Chakra UI v3](https://chakra-ui.com) design system with an OpenAI-inspired look: monochrome surfaces, hairline borders, pill-shaped controls and tight Inter typography. Light and dark mode are built in and follow the OS by default.

## Available Presets

Pick a preset during project initialization:

```bash
blacksmith init my-app --theme-color <preset>
```

| Preset | Description |
|--------|-------------|
| `default` | Monochrome: ink-black actions in light mode, white in dark mode. Pill buttons and inputs |
| `neutral` | The same monochrome palette with square corners throughout |
| `blue` | Monochrome surfaces with blue accents |
| `green` | Monochrome surfaces with green accents |
| `violet` | Monochrome surfaces with violet accents |
| `red` | Monochrome surfaces with red accents |

## How It Works

The theme lives in `frontend/src/theme/`:

| File | Purpose |
|------|---------|
| `presets.ts` | All presets plus `activePreset`, the one chosen at `init` |
| `tokens.ts` | Raw tokens: the neutral gray scale, fonts, letter spacing |
| `semantic-tokens.ts` | What components use: `bg`, `fg`, `border`, the `brand` palette and radii, each with light and dark values |
| `brand-palette.ts` | Builds the `brand` color palette from the preset's accent |
| `recipes.ts` / `slot-recipes.ts` | Component style overrides (button, input, card, menu, …) |
| `global-css.ts` | Page background, text color, and `brand` as the default `colorPalette` |
| `index.ts` | `createSystem(defaultConfig, config)`, passed to `ChakraProvider` |

Every component reads `colorPalette` tokens, and `brand` is set as the default palette on `<html>`. Changing the preset therefore restyles the whole UI.

## Switching Presets Later

Change one line in `frontend/src/theme/presets.ts`:

```ts
export const activePreset = PRESETS['violet']
```

## Customizing Colors

To use your own brand color, point the `brand` palette at a custom scale in `brand-palette.ts`, or add a new entry to `PRESETS`. Components should only use semantic tokens (`bg.muted`, `fg.subtle`, `colorPalette.solid`), not raw hex values. That way your change reaches everything and dark mode keeps working.

After adding tokens, regenerate the style-prop types for autocomplete:

```bash
npx @chakra-ui/cli typegen src/theme/index.ts
```
