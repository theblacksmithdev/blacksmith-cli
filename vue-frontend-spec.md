# Vue 3 Frontend: Parity Contract and Decisions

## What this document is

The parity contract, the decisions and the tickets for the second frontend, Vue 3. It does for the frontend what `spring-backend-spec.md` did for the fourth backend: tickets are written against it rather than against a paragraph in a roadmap.

The first revision was written before any code, with a recommendation on every decision. All eight were confirmed. This second revision records what building tickets 0, 1 and 2 measured and changed.

## What Vue is here

The second frontend, selected with `--frontend vue`. React stays the default. Vue 3 is the most used frontend framework after React, and it shares the React frontend's whole toolchain: Vite, Vitest, TypeScript, TanStack Query and the `@hey-api/openapi-ts` generator. As a result the CLI's commands barely change, and almost all of the work is content: templates, skills and docs.

The alternatives were SvelteKit, Angular, Next.js and a second React UI kit. That assessment is in the conversation that opened this document; Vue was chosen.

## The quality bar

"As well structured as the React frontend" is measurable. The generated Vue project has:

- **The same architecture**, with the same top-level folders and the same responsibilities: `api/` (client, generated code, per-resource composables), `features/` (self-contained features such as auth), `pages/` (one folder per page, owning its routes, components and tests), `router/` (paths, routes, guards, layouts), `shared/` (components, composables, utils) and `theme/`.
- **The same rules** as `~/.claude/CLAUDE.md` and the React skills: one component per file, thin layers (pages compose, components render, composables think), helpers in `utils/`, one owner per decision.
- **Idiomatic Vue, not React translated**: `<script setup lang="ts">` everywhere, the Composition API only, typed `defineProps`/`defineEmits`/`defineModel`, composables instead of hooks, router guards instead of wrapper components, Pinia for client state.
- **The same strictness**: TypeScript `strict`, `vue-tsc` in the build, ESLint (`eslint-plugin-vue` flat config, recommended plus TypeScript rules), and no `any` in the code we generate beyond what the React templates already have.
- **Tests that match the React suite**, one for one, at the same coverage.

## The parity contract

What a user can check by using the product. This is not negotiable.

- **Same pages and routes**: home, login, register, forgot password, reset password, dashboard, terms, privacy, support, and a 404 page. Each is at the same URL as in React, with the same content and the same auth behaviour (private routes redirect to login and return to the requested page after sign-in).
- **Same API layer**: the same generated client, configured the same way, with the JWT interceptor, a shared in-flight token refresh and sign-out on a failed refresh. The DRF error parsing gives the same `errorMessage` and `fieldErrors`. The smart retry skips 4xx.
- **Same `make:resource` result**: a list page, a detail page, a card, a list, a form with client (Zod) and server field errors, query and mutation composables with cache invalidation, routes registered automatically, and the same tests.
- **Same theme choices**: the six `--theme-color` presets (default, neutral, blue, green, red, violet) and light and dark mode that follows the OS, remembers an explicit choice and never flashes the wrong mode on load.
- **Same CLI**: `dev`, `sync`, `test` (including `--coverage`), `build`, `make:resource`, `setup:frontend`, `frontend <cmd>`, `eject`, `setup:ai` and `skills` behave the same; only what they run underneath differs.
- **All four backends**: Django, Express, FastAPI and Spring each work with Vue without any backend change. The backend contract is the frontend's input, so this should hold by construction, and it gets verified anyway.
- **Same AI support depth**: Vue gets the same skills as React's set (framework, data fetching, page structure, modularization, the UI kit, forms, auth, testing and design).

## The stack this implies

| Concern | React today | Vue (recommended) |
|---|---|---|
| Framework | React 19 | Vue 3.5, `<script setup>` |
| Build | Vite, `tsc -b && vite build` | Vite, `vue-tsc -b && vite build` |
| Routing | react-router 7 | vue-router 4 |
| Server state | TanStack React Query 5 | TanStack Vue Query 5 |
| Generated hooks | `@tanstack/react-query` plugin | `@tanstack/vue-query` plugin (same generator) |
| Client state | React context | Pinia (decision 2) |
| UI kit | Chakra UI v3 | Nuxt UI v4 on Tailwind CSS v4 (decision 1) |
| Forms | react-hook-form + Zod | `UForm` + Zod (decision 3) |
| Icons | lucide-react | Lucide through Iconify (`i-lucide-*`), Nuxt UI's default |
| Utilities | own `use-debounce`, `use-color-mode` | VueUse (`refDebounced`, `useColorMode`), so we don't write them |
| Tests | Vitest + Testing Library + jsdom | Vitest + `@testing-library/vue` + jsdom (decision 5) |

Exact versions are pinned when ticket 1 starts, not here.

## Where Vue's defaults break parity

These traps look fine until the frontend misbehaves. Each one gets a test or a lint rule in the generated project.

- **Static query options do not refetch.** `useQuery(listOptions({ query: { page: page.value } }))` captures the page once. Paging silently shows page 1 forever. Query composables take `MaybeRefOrGetter` parameters and pass `computed(() => ...Options(...))`, and the generated resource test pages forward to page 2.
- **Destructuring loses reactivity.** Destructuring a `reactive()` object or a store does. Props destructured in `<script setup>` are safe on Vue 3.5. Stores use `storeToRefs`. The Vue skill states the rule, and `vue/no-setup-props-reactivity-loss` is on.
- **`tsc` does not read `.vue` files.** The build runs `vue-tsc`. Without it, a type error in a component builds and ships. The CLI's CI already runs `npm run build`, so changing the script is enough.
- **The generator's Vue output has to match what the templates call.** The resource templates call `<names>ListOptions`, `<names>CreateMutation`, `<names>ListQueryKey` and so on from `@tanstack/react-query.gen`. Ticket 1 starts with a spike to confirm that the `@tanstack/vue-query` plugin generates the same helpers (and to record their names if not) into `@tanstack/vue-query.gen.ts`.
- **The auth guard runs before the session is restored.** A `beforeEach` that reads "no user" on a hard refresh of `/dashboard` bounces to login. React's `AuthGuard` waits for `loading`. The guard awaits the store's `ready` promise first.
- **Teleported UI escapes the test container.** Modals, dropdowns and toasts render through `Teleport`. `test-utils` mounts inside `UApp` with the same plugins as `main.ts`, so a test sees what a user sees.
- **Auto-imports hide where things come from.** Nuxt UI's Vite plugin auto-imports components and composables. See decision 6.
- **Colour mode flash.** Without an inline script in `index.html` that sets the `dark` class before the app loads, a dark-mode user sees a white flash on every load. React's scaffold already avoids this, and Vue must too.

## Shape of a generated project

`*` marks a file rendered from `frontend/common/`, shared with React (decision 7).

```
frontend/
├── index.html*                     # loads {{frontendEntry}}: /src/main.ts
├── vite.config.ts                  # vue(), ui({ autoImport: false, components: false, colorMode: false }), alias, port
├── openapi-ts.config.ts*           # {{queryPlugin}}: @tanstack/vue-query
├── eslint.config.js                # flat/recommended + vue-ts; no-setup-props-reactivity-loss
├── tsconfig*.json                  # vue-tsc, checkUnknownComponents
└── src/
    ├── main.ts                     # colour mode + preset before mount, installPlugins, mount
    ├── plugins.ts                  # pinia, router, VueQueryPlugin, Nuxt UI: one list for the app and the tests
    ├── App.vue                     # <UApp><RouterView /></UApp>, Vue Query devtools in dev
    ├── api/
    │   ├── client.ts*  token-storage.ts*  generated/*
    │   ├── query-client.ts         # same defaults as React
    │   └── composables/            # per-resource query and mutation composables
    ├── features/auth/
    │   ├── adapter.ts*  types.ts*  __tests__/adapter.spec.ts*
    │   ├── stores/auth-store.ts    # Pinia: user, loading, error, whenReady(), actions over the adapter
    │   ├── composables/use-auth.ts # the one import path for auth
    │   ├── schemas.ts              # Zod schemas for the four forms
    │   ├── components/AuthPanel.vue
    │   ├── pages/LoginPage.vue  RegisterPage.vue  ForgotPasswordPage.vue  ResetPasswordPage.vue
    │   └── routes.ts  index.ts
    ├── pages/
    │   ├── home/       HomePage.vue  components/{HeroSection,FeatureGrid,ExperiencePromo}.vue  routes.ts  index.ts
    │   ├── dashboard/  DashboardPage.vue  components/StackOverview.vue  routes.ts  index.ts
    │   ├── legal/      TermsPage.vue  PrivacyPage.vue  components/LegalDocument.vue  content/*  types.ts*
    │   └── support/    SupportPage.vue  components/{FaqList,ContactOptions}.vue  content/*  types.ts*
    ├── router/
    │   ├── index.ts                # createRouter, history, scroll behaviour, the guard
    │   ├── routes.ts               # app layout first, then auth; blacksmith:import / blacksmith:routes
    │   ├── guards.ts  route-meta.ts  # requiresAuth, awaiting the restored session
    │   ├── RouteErrorBoundary.vue  # onErrorCaptured around each layout's RouterView
    │   ├── paths.ts*               # Path enum + buildPath; blacksmith:path
    │   └── layouts/  MainLayout.vue  AuthLayout.vue  components/{SiteHeader,UserMenu,FooterLinks}.vue
    ├── shared/
    │   ├── components/             # BrandLogo, BrandMark, ColorModeButton, CommandSnippet, InfoCard, ListPagination,
    │   │                           # NotFoundPage, PageHeader, StatusAlert, StatusPage, TextLink
    │   ├── composables/            # use-api-query, use-api-mutation, use-color-mode
    │   └── utils/                  # api-error*, api-url*, color-mode*, format-date*, pagination*, site-config*,
    │                               # form-errors (UForm), status-icons
    ├── theme/                      # main.css (Tailwind, Nuxt UI, --ui-* variables), presets.ts, ui-config.ts, apply-preset.ts
    └── __tests__/  setup.ts  jsdom-shims.ts*  test-utils.ts   # renderWithProviders: same plugins, inside UApp
```

React's `ui/provider.tsx` and `ui/router-link.tsx` have no Vue counterpart: `UApp` and the shared `TextLink` cover them. React's `error-boundary.tsx` becomes `RouteErrorBoundary.vue`. React's `LoadingSpinner` served only its `AuthGuard`; the Vue guard is a router hook, so there is no spinner.

`make:resource Post` adds:

```
src/api/composables/posts/       index.ts  use-posts-query.ts  use-post-mutations.ts  __tests__/use-posts-query.spec.ts
src/pages/posts/                 PostsPage.vue  PostDetailPage.vue  routes.ts  index.ts  schemas.ts
                                 components/{PostList,PostCard,PostForm}.vue
                                 composables/index.ts
                                 __tests__/PostsPage.spec.ts  components/__tests__/{PostCard,PostList}.spec.ts
```

It also adds a `Path.Posts` entry and registers the routes through the same markers React uses.

## Decisions

### 1. The UI kit. Taken: Nuxt UI v4

There is no Chakra for Vue, so this choice sets the look, the theming model and half of the skills.

- **Nuxt UI v4 (recommended).** MIT-licensed since v4 absorbed Nuxt UI Pro. It runs in plain Vue and Vite through its Vite plugin, with no Nuxt needed. It is built on Reka UI's accessible primitives and Tailwind v4. Theming is semantic colours (`primary`, `neutral`) plus CSS variables, which map directly onto our six presets, including the monochrome default. It has colour mode built in and a `UForm` that validates with Zod. Two downsides: the name says Nuxt, which may confuse users, and styling moves from Chakra's style props to Tailwind classes.
- **PrimeVue 4.** The most complete component set, with design-token presets (Aura). It looks more "enterprise admin" out of the box, and getting the current look takes more theme overrides.
- **Vuetify 3.** Mature, but Material Design; it fights the current visual language.
- **shadcn-vue.** Copies components into the project, which means a large amount of generated code to own and keep current in the templates.

### 2. Client state. Taken: Pinia

React keeps auth in a context provider. The Vue counterparts are `provide`/`inject` or a module-level composable, or Pinia. Pinia is Vue's official store, has devtools and `createTestingPinia`, and is what a Vue team expects to find. The rule for the skills is the same one React's follow: server state lives in TanStack Query, and the little client state there is (the session) lives in a store.

### 3. Forms. Taken: `UForm` with the same Zod schemas

`UForm` takes a Zod schema directly. Server field errors from `useApiMutation().fieldErrors` are fed in with `form.setErrors`. This keeps React's rule: client errors win, then server errors. VeeValidate is the alternative. It is more powerful, but it is a second library doing what the UI kit already does.

### 4. File naming. Taken: PascalCase `.vue`, kebab-case `.ts`

The Vue style guide and the ecosystem use PascalCase single-file components (`PostCard.vue`). Everything that isn't a component keeps the React project's kebab-case (`use-posts-query.ts`, `auth-store.ts`, `routes.ts`). The result is idiomatic Vue, and it stays consistent with the rest of the generated tree and with `make:resource`'s naming helpers.

### 5. Tests. Taken: `@testing-library/vue` on Vitest and jsdom

It uses the same queries and the same behaviour-first style as the React suite, so the testing skill keeps its philosophy and the spec files can be ported nearly line for line. `@vue/test-utils` sits underneath for the cases Testing Library doesn't cover.

### 6. Auto-imports. Taken: off everywhere, Nuxt UI's components included

The Vite plugin can auto-import Vue APIs, VueUse and components. Implicit imports make generated code harder to read and harder for an AI agent to follow. Explicit imports for everything we write, and `U*` components auto-registered (the prefix makes them unambiguous) with their type declarations committed. If the plugin can't split it this way, explicit imports everywhere.

Built: explicit imports everywhere (`import UButton from '@nuxt/ui/components/Button.vue'`), with the plugin's `components` and `autoImport` both off. Auto-registered components type-check only through a `components.d.ts` that Vite writes as it transforms each file, so a clean checkout or CI running `vue-tsc` first fails until something has run the dev server. Explicit imports need no generated file, and `vueCompilerOptions.checkUnknownComponents` turns a forgotten import into a `vue-tsc` error. The full `strictTemplates` is not used: it also rejects fallthrough attributes such as `aria-label` on components.

### 7. Shared templates. Taken: a `common` layer rendered under both frameworks

About 15 template files contain no React at all: the API client, token storage, the auth adapter and its types and test, the paths registry and its test, the API URL, the site config, the legal and support content and types, `api-error.ts`, and the public assets. Copying them into a Vue tree would give every auth or API fix two owners. Instead, `frontend/common/` is rendered first and `frontend/react/` or `frontend/vue/` on top. That is the template-level form of "one owner per decision".

Part of this is one deliberate change to React's output. `api-error.ts` moves from `shared/hooks/` to `shared/utils/`: it is a parser, not a hook, and in Vue's tree a `hooks/` folder would be wrong. The React imports and skills are updated in the same change.

### 8. The CLI surface. Taken: `--frontend react|vue`, recorded in the config

- `init --frontend vue`. Without the flag, `init` asks, with `react` as the default.
- `blacksmith.config.json` records `frontend.framework`. An absent value reads as `react`, so every existing project keeps working, the same way `backend.framework` absent reads as Django.
- `--no-chakra-ui-skill` becomes `--no-ui-skill`, and the old flag stays as a hidden alias.
- The docs MCP server that `setup:ai` installs becomes per-framework. It stays Chakra for React; for Vue it is Nuxt UI's, after confirming that Nuxt UI publishes one.

## Ticket 0: one table per frontend framework

No user-visible change: React projects are generated as before, except for the `api-error.ts` move.

- `src/utils/frontend-toolchains.ts` holds a `FrontendToolchain` per framework, keyed on a new `FrontendFramework` type, as `BACKEND_TOOLCHAINS` is. It contains:
  - the label;
  - the template directories (`common` plus the framework's own);
  - the generated query file name (for `sync`'s output and the templates);
  - the resource generator: where the API composables or hooks and the page go, the template directories, and the files and markers to register in;
  - the AI skills;
  - the docs MCP server;
  - the `eject` wording.
- Files that branch today and become lookups:
  - `init.ts`, for the template directory and the "React" label;
  - `make-resource.ts`, whose frontend half moves behind a `RESOURCE_FRONTENDS` table the way the backend half already sits behind `RESOURCE_BACKENDS`;
  - `sync.ts`;
  - `eject.ts`;
  - `mcp-setup.ts`;
  - `ai-setup.ts`, `skills.ts` and `skills/selection.ts`, where `CHAKRA_UI_SKILLS` becomes per framework;
  - `index.ts`, for the flags and the descriptions, which still say "Django, Express, or FastAPI + React".
- The templates move to `frontend/common/` and `frontend/react/`, and `resource/pages` and `resource/api-hooks` move to `resource/frontend/react/`.
- `paths.ts` gains `getFrontendFramework()`.

**Done when:**
- A React project is generated for each of the four backends before and after the change, and `diff -r` shows only the `api-error.ts` move.
- The CLI test suite passes.
- Adding `'vue'` to `FrontendFramework` makes the compiler list every table that needs a Vue entry.

## Ticket 1: the Vue scaffold

`blacksmith init --frontend vue` generates the tree above for frontend-only and fullstack projects on all four backends.

1. **Spike, first:**
   - Confirm the `@tanstack/vue-query` plugin's helper names and output path, and record them here.
   - Confirm that Nuxt UI v4 runs with vue-router in plain Vite, and that its auto-import can be limited to components (decision 6).
   - Confirm that `vue-tsc` accepts the generated client.
2. **Scaffold:**
   - Every page and feature in the parity contract.
   - All six theme presets.
   - Colour mode without a flash.
   - The auth flow, including the restore-on-reload and the expired-refresh sign-out.
3. **Tests:** ports of every React spec, which are:
   - the adapter;
   - paths;
   - api-error;
   - the debounce test, which becomes a test of our use of `refDebounced` only if any logic remains, and is otherwise dropped along with the composable;
   - colour mode;
   - the not-found page;
   - the legal document;
   - support.

   Plus one Vue-specific test for the auth guard on a hard refresh.
4. **CI template:** the frontend job is unchanged (it runs `npm run build` and `npm run test`). Check this under `act`.

**Measured when it lands:** `init` time, `dev` cold start, the time from a save to hot module replacement, the size of the production build compared with React's, and the coverage percentage.

## Ticket 2: `make:resource`, skills and full support

1. **`make:resource` for Vue:** the resource tree above, registering into `paths.ts` and `routes.ts`. Its tests include paging to page 2, which guards the reactivity trap.
2. **Skills:** each React skill gets a Vue counterpart, at the same depth:
   - `vue` (SFC conventions, reactivity rules, composables);
   - `vue-query` (the API composables and the getter rule);
   - `page-structure` and `frontend-modularization`, made per framework, or with their shared prose kept in one place;
   - `nuxt-ui` (components, theming, presets);
   - `nuxt-ui-forms` (`UForm`, Zod and server errors);
   - `vue-auth` (the store, `useAuth` and the guards);
   - `blacksmith-composables`;
   - `frontend-testing` for Vue;
   - `ui-design`, with the Nuxt UI specifics.

   `project-overview` and `blacksmith-cli` take the frontend from the config.
3. **Docs:**
   - a `stack/frontend-vue.md` page;
   - a "Choosing a frontend" guide, next to "Choosing a backend";
   - `init`, `make:resource`, `creating-resources`, `testing`, `project-structure`, `theme-colors`, `quick-start`, `setup-ai` and the README.
4. **Verification, for each of the four backends with Vue:**
   - `init`, `dev`, register, sign in, `make:resource Post`, then create, edit, page, delete and sign out in a browser in both colour modes;
   - `build`, `test --coverage`, and the generated CI under `act`;
   - one clean Linux run;
   - the generated TypeScript client must be identical to React's for the same backend and resource;
   - axe reports no violations on the auth, list and detail pages.

## What building it changed

Tickets 0, 1 and 2 landed together. The parity contract holds: on FastAPI, a Vue and a React project generated with the same resource type-check, pass their suites and work through the same browser walk (sign-up, sign-in, the guard on a hard refresh, the user menu, a bad password, support, terms, 404, then create, client and server validation, detail, edit, refresh, delete, and paging to page 2) with no console errors.

**Ticket 0, the table.** `src/utils/frontend-toolchains.ts` holds the label, the entry module, the query plugin, the docs MCP server and the `make:resource` paths per framework. `src/utils/resource-frontend.ts` is the frontend half of `make:resource`, shared by both. The skills select per framework in `selection.ts`, and the framework-neutral skills read their frontend wording from `src/skills/frontend-profiles.ts`, as they already did from `backend-profiles.ts`. The before/after diff of four generated React projects showed only the `api-error.ts` move and the new `frontend.framework` field.

**The spike.** All three unknowns came out as planned or better:

- The `@tanstack/vue-query` plugin emits the same helper names as React's into `@tanstack/vue-query.gen.ts`, so the resource templates share their API calls. Its options are plain objects, which is the reactivity trap: the composables wrap them in getters, and a generated test pages to page 2.
- Nuxt UI 4.11 runs in plain Vite with vue-router 4.6.
- Its auto-import can be turned off (decision 6 above).

**Versions pinned:** Vue 3.5, vue-router 4.6, Pinia 4, Nuxt UI 4.11, Tailwind 4.3, TanStack Vue Query 5.104, VueUse 14 (Nuxt UI's), Vite 6 and Vitest 3 (as React), TypeScript 5.8 with vue-tsc 3, ESLint 9 with eslint-plugin-vue 10, `@testing-library/vue` 8.

**Traps found while building, and their fixes:**

- **Both layouts sit at `/`.** A layout route also matches its own path, and the first one wins a tie, so `/` rendered an empty auth layout. The app layout comes first, and `router/__tests__/routes.spec.ts` pins which layout each URL opens in.
- **Nuxt UI's neutral scale is its own.** It reads `--ui-color-neutral-*` (mapped to a renamed Tailwind palette), so overriding Tailwind's `--color-neutral-*` changed nothing. `main.css` sets the `--ui-color-neutral-*` variables directly.
- **jsdom cannot parse cascade layers.** Nuxt UI's runtime color styles hit the same jsdom limit Chakra's did. The filter and the `matchMedia` and `ResizeObserver` shims now live once, in `common/src/__tests__/jsdom-shims.ts`.
- **Handlebars and Vue both use `{{ }}`.** Vue SFCs with no template variables ship as plain `.vue` files. Those with variables escape Vue's interpolations as `\{{ }}`, and the brace preprocessor in `utils/template.ts` now leaves an escaped interpolation alone, so `\{{ {{name}}.title }}` renders `{{ post.title }}`. The template test only flags the spaceless `{{Name}}` form in `.vue` output.
- **The generated mutation options are vue-query's ref-or-getter union.** `useApiMutation` takes the plain-object branch of it, and `invalidateKeys` may be a getter, read when the mutation succeeds.

**Shared rather than copied.** Besides the files listed in decision 7, both frontends now share:

- the color-mode store;
- `shouldRetryRequest` (React's query hook had its own copy of the status parsing);
- `format-date`;
- `PAGE_SIZE`;
- the jsdom shims;
- the `any`-free typing of `api-error.ts` and the auth adapter.

**Both frontends gained, in ticket 2:**

- a create dialog on the list page;
- an edit dialog on the detail page (React's Edit button pointed at an `/edit` route that never existed);
- pagination through a shared `ListPagination`;
- cards and lists typed with the generated resource type;
- readable labels ("New blog post", not "New blogPost"), from new `Label`/`label` name variants.

**Measured,** on a machine with the npm cache warm:

| | Vue | React |
|---|---|---|
| Frontend tests after `make:resource` | 53 | 51 |
| Production JS, gzipped (main chunk) | 154 KB | not measured |

**Verified on every backend.** Django, Express, FastAPI and Spring each generated a Vue project. On each, `make:resource BlogPost`, `blacksmith test` (both suites), ESLint, `npm run build` and the full browser walk passed. The runs found two more traps:

- **The id's type is the backend's.** Django's generated resource id is a UUID string, while FastAPI's is a number. Typing test fixtures with the generated type broke on one or the other, for React too. The fixtures carry only the fields the component reads, cast through `unknown`, with a comment saying why.
- **Vue needs a newer Node than React.** Nuxt UI 4 and `@vitejs/plugin-vue` 6 need `^20.19.0 || >=22.12.0`, and the build fails on 20.10 with an opaque Vite error. Each frontend toolchain now carries its Node floor, and `init` checks it with the other prerequisites and stops before writing anything. CI's `node-version: '20'` already resolves to a current 20.x.

**Left open:**

- React's `lint` script has no ESLint dependency or config, so it does not run. Vue's does. That is a React fix for its own change.
- Chakra's `required` on React's form fields shows the browser's validation bubble before Zod's message. Vue's forms show Zod's message.

## Open questions

- **Studio.** Studio previews and edits the frontend. Does it assume React or Chakra anywhere? It belongs to the Studio stream, but needs checking before Vue ships so that Studio can refuse Vue projects clearly rather than break on them.
- **The resource Create button.** React's resource page has no wired Create form today. Vue should match React exactly, which keeps parity simple. The alternative is to fix both in ticket 2. Recommended: fix both, since it is the same small change twice.
- **`eject`.** It names the stack. With two frontends it reads the label from the toolchain table; nothing else changes.

## Out of scope

- Nuxt and server-side rendering.
- The Options API.
- Pinia Colada, which would replace TanStack Query.
- Internationalisation.
- A Vue Studio.
- Migrating an existing React project to Vue.
- Any Vue feature a scaffolded project does not need to be considered supported.
