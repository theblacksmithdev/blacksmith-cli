---
sidebar_position: 2
---

# Theme Colors

Blacksmith supports several color presets for the frontend UI, applied through Tailwind CSS.

## Available Presets

Set the theme during project initialization:

```bash
blacksmith init my-app --theme-color <color>
```

| Preset | Description |
|--------|-------------|
| `default` | Orange/amber tones (Blacksmith's signature color) |
| `blue` | Blue palette |
| `green` | Green palette |
| `violet` | Purple/violet palette |
| `red` | Red palette |
| `neutral` | Gray/neutral palette |

## How It Works

The theme color is applied through Tailwind CSS configuration in `frontend/tailwind.config.js`. The selected preset maps to a set of CSS custom properties and Tailwind color utilities used throughout the generated components.

## Customizing Colors

After project creation, you can customize colors by editing the Tailwind configuration:

```javascript
// frontend/tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          // ... define your custom palette
          900: '#7f1d1d',
        },
      },
    },
  },
};
```

The generated components use Tailwind utility classes like `bg-primary-500`, `text-primary-700`, etc., so changing the `primary` color palette updates the entire UI.
