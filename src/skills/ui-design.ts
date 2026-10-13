import type { Skill, SkillContext } from './types.js'
import { UI_DESIGN_SPECIFICS } from './ui-design-specifics.js'
import { frontendProfile } from './frontend-profiles.js'

export const uiDesignSkill: Skill = {
  id: 'ui-design',
  name: 'UI/UX Design System',
  description: 'Design principles, spacing, typography, color, layout patterns, and interaction guidelines for the OpenAI-inspired theme.',

  render(ctx: SkillContext): string {
    const ui = UI_DESIGN_SPECIFICS[frontendProfile(ctx).framework]

    return `## UI/UX Design System — OpenAI-Inspired Monochrome

> **Design philosophy: Quiet, precise, content-first.**
> The theme follows the OpenAI / ChatGPT design language — monochrome surfaces, hairline borders, pill-shaped controls, tight Inter typography, and almost no decoration. The system lives in \`src/theme/\`; change it there, never per component.

### Core Principles

1. **Monochrome first** — Primary actions are ink-black in light mode and white in dark mode ${ui.brand}. Color is reserved for status (error, success, warning). Never add decorative color
2. **Flat with hairlines** — No gradients, no heavy shadows. ${ui.hairlines} (menus, popovers, hovered cards)
3. **Whitespace is a feature** — Generous padding and margins create hierarchy. When in doubt, add more space
4. **Consistency over creativity** — Reuse \`PageHeader\`, \`InfoCard\`, \`StatusAlert\`, \`StatusPage\` so every page feels like the same app
5. **Progressive disclosure** — Show only what's needed. Use tabs, dialogs, and drill-down navigation to manage complexity

### Spacing

${ui.spacing}

| Scale | Use for |
|-------|---------|
| \`1\`–\`2\` | Icon-to-text gaps, tight badge padding |
| \`3\`–\`4\` | Inner component padding, gap between related items |
| \`5\`–\`6\` | Card padding, form field spacing |
| \`8\` | Gap between sections within a page |
| \`12\`–\`20\` | Gap between major page sections, hero padding |

${ui.spacingRules}

### Typography

${ui.typography}

| Level | Component | Use for |
|-------|-----------|---------|
${ui.typographyRows}

- One \`h1\` per page. Never skip heading levels
${ui.typographyRules}

### Color

${ui.color}
- Maximum 2–3 colors visible at once. Colorful UIs feel noisy
${ui.colorRules}

### Dark Mode

> **Every screen and component MUST render correctly in both light and dark mode.**

${ui.dark}

### Interactions & Feedback

${ui.interactions}
- **Touch targets**: Minimum 44x44px for interactive elements on mobile

### Responsive Design

${ui.responsive}

For the full component reference, ${ui.componentSkill}.
`
  },
}
