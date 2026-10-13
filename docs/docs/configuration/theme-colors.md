---
sidebar_position: 2
---

# Theme Colors

Both frontends share an OpenAI-inspired look: monochrome surfaces, hairline borders, pill-shaped controls and tight Inter typography. The React frontend builds it with a [Chakra UI v3](https://chakra-ui.com) design system; the Vue frontend with [Nuxt UI v4](https://ui.nuxt.com) on Tailwind CSS v4. Light and dark mode are built in and follow the OS by default, and the same six presets apply to both.

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

## How It Works (React)

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

## How It Works (Vue)

The theme lives in `frontend/src/theme/`:

| File | Purpose |
|------|---------|
| `presets.ts` | All presets plus `activePreset`, the one chosen at `init` |
| `ui-config.ts` | Nuxt UI's color aliases (`primary`, `neutral`) and component overrides (pill buttons, inputs and badges), built from the active preset. `vite.config.ts` passes it to the Nuxt UI plugin |
| `apply-preset.ts` | Sets `data-accent` and `data-corners` on `<html>` before the app mounts |
| `main.css` | Imports Tailwind and Nuxt UI; sets the font, the neutral scale, the `--ui-*` surface, text and border colors for light and dark, the `mono` accent, square corners, and the `interactive-card` utility |

Components use Nuxt UI's semantic classes (`bg-default`, `text-muted`, `border-default`), so changing the preset restyles the whole UI.

## Switching Presets Later

Change one line in `frontend/src/theme/presets.ts`:

```ts
export const activePreset = PRESETS['violet']
```

In a Vue project, restart `blacksmith dev` afterwards: the Nuxt UI plugin reads the preset when the dev server starts.

## Customizing Colors (React)

To use your own brand color, point the `brand` palette at a custom scale in `brand-palette.ts`, or add a new entry to `PRESETS`. Components should only use semantic tokens (`bg.muted`, `fg.subtle`, `colorPalette.solid`), not raw hex values. That way your change reaches everything and dark mode keeps working.

After adding tokens, regenerate the style-prop types for autocomplete:

```bash
npx @chakra-ui/cli typegen src/theme/index.ts
```

## Customizing Colors (Vue)

Set `colors.primary` in `src/theme/ui-config.ts` to any Tailwind color, or add a new entry to `PRESETS`. To change surfaces and text, edit the `--ui-*` variables in `main.css`. Components should only use the semantic classes, never raw palette classes like `text-gray-500`, so the change reaches everything and dark mode keeps working.
