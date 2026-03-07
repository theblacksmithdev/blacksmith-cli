import type { Skill, SkillContext } from './types.js'

export const cleanCodeSkill: Skill = {
  id: 'clean-code',
  name: 'Clean Code Principles',
  description: 'Naming, functions, components, file organization, conditionals, error handling, and DRY guidelines.',

  render(_ctx: SkillContext): string {
    return `## Clean Code Principles

Write code that is easy to read, easy to change, and easy to delete. Treat clarity as a feature.

### Naming
- Names should reveal intent. A reader should understand what a variable, function, or class does without reading its implementation
- Booleans: prefix with \`is\`, \`has\`, \`can\`, \`should\` — e.g. \`isLoading\`, \`hasPermission\`, \`canEdit\`
- Functions: use verb phrases that describe the action — e.g. \`fetchUsers\`, \`createOrder\`, \`validateEmail\`
- Event handlers: prefix with \`handle\` in components, \`on\` in props — e.g. \`handleSubmit\`, \`onSubmit\`
- Collections: use plural nouns — e.g. \`users\`, \`orderItems\`, not \`userList\` or \`data\`
- Avoid abbreviations. \`transaction\` not \`txn\`, \`button\` not \`btn\`, \`message\` not \`msg\`
- Avoid generic names like \`data\`, \`info\`, \`item\`, \`result\`, \`value\` unless the scope is trivially small (e.g. a one-line callback)

### Functions
- A function should do one thing. If you can describe what it does with "and", split it
- Keep functions short — aim for under 20 lines. If a function is longer, look for sections you can extract
- Prefer early returns to reduce nesting. Guard clauses at the top, happy path at the bottom
- Limit parameters to 3. Beyond that, pass an options object
- Pure functions are easier to test, reason about, and reuse. Prefer them where possible
- Don't use flags (boolean parameters) to make a function do two different things — write two functions instead

### Components (React-specific)
- One component per file. The file name should match the component name
- Keep components under 100 lines of JSX. Extract sub-components when they grow beyond this
- Separate data logic (hooks) from presentation (components). A component should mostly be JSX, not logic
- Props interfaces should be explicit and narrow — accept only what the component needs, not entire objects
- Avoid prop drilling beyond 2 levels — use context or restructure the component tree
- Destructure props in the function signature for clarity

### File Organization
- Keep files short. If a file exceeds 200 lines, it is likely doing too much — split it
- Group by feature, not by type. \`features/orders/\` is better than \`components/\`, \`hooks/\`, \`utils/\` at the top level
- Co-locate related code. A component's hook, types, and test should live next to it
- One export per file for components and hooks. Use \`index.ts\` barrel files only at the feature boundary

### Conditionals & Logic
- Prefer positive conditionals: \`if (isValid)\` over \`if (!isInvalid)\`
- Extract complex conditions into well-named variables or functions:
  \`\`\`ts
  // Bad
  if (user.role === 'admin' && user.isActive && !user.isSuspended) { ... }

  // Good
  const canAccessAdminPanel = user.role === 'admin' && user.isActive && !user.isSuspended
  if (canAccessAdminPanel) { ... }
  \`\`\`
- Avoid deeply nested if/else trees. Use early returns, guard clauses, or lookup objects
- Prefer \`switch\` or object maps over long \`if/else if\` chains:
  \`\`\`ts
  // Bad
  if (status === 'active') return 'green'
  else if (status === 'pending') return 'yellow'
  else if (status === 'inactive') return 'gray'

  // Good
  const statusColor = { active: 'green', pending: 'yellow', inactive: 'gray' }
  return statusColor[status]
  \`\`\`

### Error Handling
- Handle errors at the right level — close to where they occur and where you can do something meaningful
- Provide useful error messages that help the developer (or user) understand what went wrong and what to do
- Don't swallow errors silently. If you catch, log or handle. Never write empty \`catch {}\` blocks
- Use typed errors. In Python, raise specific exceptions. In TypeScript, return discriminated unions or throw typed errors

### Comments
- Don't comment what the code does — make the code readable enough to not need it
- Do comment why — explain business decisions, workarounds, non-obvious constraints
- Delete commented-out code. Version control remembers it
- TODOs are acceptable but should include context: \`// TODO(auth): rate-limit login attempts after v1 launch\`

### DRY Without Overengineering
- Don't repeat the same logic in multiple places — extract it once you see the third occurrence
- But don't over-abstract. Two similar blocks of code are fine if they serve different purposes and are likely to diverge
- Premature abstraction is worse than duplication. Wait for patterns to emerge before creating shared utilities
- Helper functions should be genuinely reusable. A "helper" called from one place is just indirection

### Python-Specific (Django)
- Use \`f-strings\` for string formatting, not \`.format()\` or \`%\`
- Use list/dict/set comprehensions when they are clearer than loops — but don't nest them
- Use \`dataclasses\` or typed dicts for structured data outside of Django models
- Keep view methods thin — push business logic into model methods, serializer validation, or service functions
- Use \`get_object_or_404\` instead of manual \`try/except DoesNotExist\`

### TypeScript-Specific (React)
- Use strict TypeScript. Don't use \`any\` — use \`unknown\` and narrow, or define a proper type
- Define interfaces for component props, API responses, and form schemas
- Use \`const\` by default. Only use \`let\` when reassignment is necessary. Never use \`var\`
- Prefer \`map\`, \`filter\`, \`reduce\` over imperative loops for data transformation
- Use optional chaining (\`?.\`) and nullish coalescing (\`??\`) instead of manual null checks
- Keep type definitions close to where they are used. Don't create a global \`types.ts\` file
`
  },
}
