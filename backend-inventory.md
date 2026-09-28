# Backend Inventory: Every Two-Backend Assumption (TBOL-001)

**Status:** Record of the current shape of the problem. This document changes
no behaviour; the CLI's test suite passes exactly as it did before.

This is the written record for TBOL-001. It names every place the Blacksmith
CLI assumes there are exactly two backends — Django and Express — with what
each site does today and what each must say once there are three (FastAPI being
the requested third). It also states the single design decision the rest of
the sprint will implement.

Line numbers are as of commit `63caf26`.

---

## The one decision

> **The backend is a list of three. Behaviour follows the chosen framework.
> Nothing re-derives "which backend am I" from "is it Express".**

What this means for the sprint:

- `BackendFramework` is the list. It gains a third member and remains the only
  list; every site below either consumes the framework value or looks it up in
  a per-framework table. No site keeps a second, hand-maintained copy of the
  list.
- The value read from `blacksmith.config.json` flows to every site. Sites
  consume it directly (label, run command, template directory, skill set),
  keyed by the framework name — not through an intermediate boolean.
- The `isExpress` / `isDjango` booleans and their `else` branches disappear.
  "Not Express" is never again used to mean "Django", because with three
  backends "not Express" means one of two things. No `isFastapi` boolean is
  introduced either — a third boolean is the same re-derivation with more
  booleans.
- The absent-`framework` fallback in the config stays `django` (backward
  compatibility for pre-Express projects). It is a recorded fallback value,
  not an else-branch.

---

## The shape of the assumption

The CLI's root assumption is a two-member union in `src/utils/paths.ts`:

```ts
export type BackendFramework = 'django' | 'express'
```

`getBackendFramework()` returns that value from the config (absent → `django`).
But almost no consumer switches on the value. Each consumer converts it into a
boolean — `isExpress = framework === 'express'` — and every else-branch means
Django. That is the assumption this record inventories: 12 commands, 5 utils, 2
skill generators, 2 templates, and a handful of shared frontend templates that
carry Django-flavoured copy, plus CLI-facing docs.

Verified free of the assumption (not part of this inventory): `packages/studio/`
(no framework branching) and the repository's own `.github/` workflows.

---

## Inventory

### 1. The type and config — root of the assumption

| Site | Today | With three backends |
|---|---|---|
| `src/utils/paths.ts:104` — `type BackendFramework = 'django' \| 'express'` | Only two strings type-check; every consumer below is typed against this union. | The union is the list: add `'fastapi'`. Any site that still hardcodes two stops compiling. |
| `src/utils/paths.ts:110` — `config.backend.framework?: BackendFramework` | The framework is stored as a string in `blacksmith.config.json`; two valid values. | A third value is stored. Storage already generalizes — no code change beyond the union. |
| `src/utils/paths.ts:56-59` — `getBackendFramework()` | Absent field reads as `'django'` so pre-Express projects keep working. | The fallback stays `'django'` as a deliberate, documented backward-compat default — not as "the non-Express case". |

### 2. CLI surface

| Site | Today | With three backends |
|---|---|---|
| `src/index.ts:22,32` | Description "Fullstack Django or Express + React framework"; `--backend` help "django or express (default: django)". | Both mention three frameworks. |
| `src/commands/init.ts:27` — `BACKEND_FRAMEWORKS: BackendFramework[] = ['django', 'express']` | The one hand-maintained list. Drives `--backend` validation (line 65, error text "Must be one of: django, express"), the interactive prompt (line 76), and the prompt fallback (lines 79-81). | The list gains `'fastapi'` and remains the single source. The error text is built from the list rather than a string literal naming two. |

### 3. `init` — the boolean and everything that branches on it

`src/commands/init.ts:84` derives `isExpressBackend = needsBackend && backendFramework === 'express'`, then branches on it in six places:

| Sub-site | Today | With three backends |
|---|---|---|
| Prerequisite checks (`init.ts:136-157`) | Python 3 required only when `!isExpressBackend`; Node/npm required for a frontend or an Express backend. | Prereqs keyed off the framework's own needs (FastAPI needs Python, not Node), not off "is it Express". |
| Config display and spinner labels (`init.ts:110,194`) | `'Express' : 'Django'` ternary. | Label derived from the framework value. |
| Backend install steps (`init.ts:217-282`) | Express → `npm install` + Prisma generate/migrate; else venv + pip + Django migrations. | A per-framework install step. FastAPI gets its own (pip-based, no `manage.py` migrations) — behaviour follows the chosen framework. |
| First OpenAPI sync (`init.ts:318-364`) | Express → offline `syncFrontendClient()`; else boot `manage.py runserver`, wait, run openapi-ts, kill the server. | A per-framework sync strategy. "Can export offline" is a framework property, not an Express property. |
| Stub comment (`init.ts:381`) | Stub generated for the typed client says "from your Django API schema" — for Express projects too. | Neutral wording (the stub is backend-agnostic). |

### 4. `printNextSteps` output

| Site | Today | With three backends |
|---|---|---|
| `src/utils/logger.ts:120-125` | Label `'Express:'` vs `'Django: '`; the ReDoc URL is printed only when the framework is not Express. | Label from the framework value. ReDoc is shown per framework capability (drf-spectacular and FastAPI both serve `/api/redoc/`; Express does not). |

### 5. Scaffolding utilities

| Site | Today | With three backends |
|---|---|---|
| `src/utils/scaffold.ts:13-35` — `projectLayout()` | Emits `isDjango` / `isExpress` booleans into the template context, plus `schemaFile` computed from a boolean. Templates branch on the booleans. | Context carries the framework value. Templates branch on equality with the framework name (the `eq` Handlebars helper already exists in `src/utils/template.ts:8`) or read a per-framework value. The booleans go away. |
| `src/utils/scaffold.ts:44-51` — `backendTemplateDir()` / `resourceTemplateDir()` | Join `backend/<framework>` into the template tree. Two directories exist: `src/templates/backend/{django,express}` and `src/templates/resource/backend/{django,express}`. | Already keyed by name: a `backend/fastapi` directory just works. Code unchanged; new template trees are the work. |
| `src/utils/scaffold.ts:60-62` — `resourcePrismaTemplate()` | Returns the hardcoded Express-only Prisma fragment `resource/backend/express.prisma.hbs`, used only by the Express resource generator. | Already framework-keyed: a FastAPI resource flow simply never calls it. No change. |
| `src/utils/gitignore.ts:9-13` — `GitignoreKind` | Union includes `'backend/django' \| 'backend/express'`. `src/commands/setup-backend.ts:174,279` heal missing `.gitignore`s with these hardcoded kinds. | Add `'backend/fastapi'`. Heal sites choose the kind from the framework instead of hardcoding. |

### 6. CI workflow template

| Site | Today | With three backends |
|---|---|---|
| `src/templates/project/.github/workflows/ci.yml.hbs:17,94` | `{{#if isExpress}}` — backend job is vitest + Prisma, else pytest + Django; the fullstack frontend job installs backend deps and exports the schema per framework (`npm run openapi` vs `manage.py spectacular`). | A per-framework job (equality branch per framework, or framework-keyed partials). The `else` branch must not mean Django. |

### 7. OpenAPI sync chain

| Site | Today | With three backends |
|---|---|---|
| `src/utils/openapi.ts:11-13` — `schemaFileName(isExpress)` | JSON (`_schema.json`) for Express, YAML (`_schema.yml`) else. | Per-framework filename; the parameter becomes the framework. |
| `src/utils/openapi.ts:65-78` — `exportBackendSchema(backendDir, schemaPath, isExpress)` | `npm run openapi` vs `manage.py spectacular`. | A per-framework export command. |
| `src/utils/openapi.ts:85-93` — `syncFrontendClient(..., isExpress)` | Passes the boolean through to the two above. | Framework value end to end. |
| `src/commands/sync.ts:23,27` | Re-derives `isExpress` from `getBackendFramework()` and passes it on. | Pass the framework value on. |

### 8. Commands that dispatch on the boolean

| Site | Today | With three backends |
|---|---|---|
| `src/commands/dev.ts:39` — `isExpressBackend` | Branches four ways: banner label (`:65` `'Express'` vs `'Django '`), sync-watcher copy (`:72`), the backend process (`:81-97` `npm run dev` with `PORT` env vs `./venv/bin/python manage.py runserver`), and watcher parameters (`:119-125` source extension `.ts`/`.py`, ignored prefixes `node_modules/, dist/, .git/` vs `venv/`, ignored fragments). | Per-framework run command, source extension, ignore lists and label. |
| `src/commands/test.ts:119-121` | Express → vitest via `npm run test*` scripts; else pytest through the venv. | A per-framework test runner. |
| `src/commands/build.ts:16,36-71` | Express → `npm run build` (tsc); else `manage.py collectstatic`; summary line differs (`Backend output: dist/` vs `Backend ready for deployment`). | A per-framework build step. |
| `src/commands/backend.ts:25,27-48` | `isExpress` picks the usage copy (Django management command vs npm command) and the dispatch (`manage.py <args>` vs `npm <args>`). | A per-framework command mapping. FastAPI has no `manage.py`, so its passthrough semantics are chosen per framework, not defaulted to Django's. |
| `src/commands/make-resource.ts:118,124-135,149-219,227` | `isExpressBackend` picks the backend resource directory (`src/modules/<kebab>` vs `apps/<snake>`), the existence-error wording, the generator (Express module + Prisma model + router mount vs Django app + `INSTALLED_APPS` + URLs + migrations), and the `syncFrontendClient` call. | Per-framework resource layout, generator and wording. |
| `src/commands/eject.ts:17,40-41` | `backendName` `'Express'`/`'Django'`; `startBackend` `npm run dev` vs `./venv/bin/python manage.py runserver`. | Per-framework name and start command. |
| `src/commands/setup.ts:28-31` | Builds the CI context via `projectLayout(type, getBackendFramework(root))` — the value already flows through. | Unchanged. Listed so nobody re-introduces a boolean here; the assumption it feeds lives in the CI template (section 6). |
| `src/commands/setup-backend.ts:10-14,44-47,55-60,220,336` | `BackendProject` carries `isExpress`. `rejectOnExpress` hardcodes `'"<command>" applies to Django backends. This project uses Express.'`. `setupBackendDeps` / `setupBackend` dispatch Express vs the Python flow. | Rejection text derived from the actual framework; the Python-only subcommands reject on any non-Django backend. Per-framework setup steps. |

### 9. AI skills generation

| Site | Today | With three backends |
|---|---|---|
| `src/commands/ai-setup.ts:58-69` | Express gets the express/express-prisma/express-openapi trio; the `else` gets the Django quartet (django, django-rest-advanced, api-documentation, backend-modularization). | A per-framework skill list in a lookup table. "Else = Django skills" stops being the fallback. |
| `src/commands/skills.ts:27-38,54-63` | `djangoBackendSkills` and `expressBackendSkills` arrays; a ternary in `skillsFor()` picks between exactly two. | Per-framework list and lookup. |
| `src/skills/types.ts:6` — `SkillContext.backendFramework?` | Typed to the two-member union. | Widens automatically with the union; no further change. |
| `src/skills/project-overview.ts:9-27,88,94,99` | `isExpress` picks the backend name, both tree diagrams, the `build` column, and the workflow steps. | Per-framework content. |
| `src/skills/blacksmith-cli.ts:9-11,39,66,85,98` | `isExpress` picks the backend name, source extension, the config example, the `make:resource` bullets, the sync command and the init example. | Per-framework content. |
| Framework skill files (`src/skills/django.ts`, `django-rest-advanced.ts`, `api-documentation.ts`, `backend-modularization.ts`, `express.ts`, `express-prisma.ts`, `express-openapi.ts`) | One file per framework/convention; two sets exist. | A FastAPI set (new files), wired into the two sites above. |

### 10. Shared frontend templates carrying Django-flavoured copy

These render for **every** backend — an Express project's generated frontend
today says "Django" in several places:

| Site | Today | With three backends |
|---|---|---|
| `src/templates/frontend/src/pages/dashboard/components/stack-cards.tsx.hbs:26,33` | Backend card badge and description hardcode "Django" / "Django REST API…" unconditionally. | Badge and copy follow the framework from the render context (`backendFramework` is already in the context — section 5). |
| `src/templates/frontend/src/pages/home/home.tsx.hbs:74-77` | A "Django Admin" link to `/admin/` is rendered unconditionally — Express projects get a dead link. | Admin link only for frameworks that ship an admin (Django), per framework. |
| `src/templates/frontend/src/api/client.ts.hbs:52-63` | The CSRF interceptor ("Django requires this for non-GET requests") is unconditional. | Auth wiring per framework; bearer-JWT-only frameworks skip CSRF. |
| `src/templates/frontend/src/features/auth/adapter.ts.hbs:4,25` | Comments and `mapDjangoUser` name Django. The wire format is identical by design, so this is naming only. | Neutral naming. |
| `src/templates/frontend/src/router/layouts/auth-layout.tsx.hbs:21` | Copy: "powered by Django, React, and Blacksmith." | Per-framework copy. |
| `src/templates/frontend/src/shared/hooks/api-error.ts.hbs:4` | Comment: "Parses Django REST Framework error responses." Express deliberately reproduces DRF's error shape (identical contract), so only the comment is wrong. | Neutral comment. |
| `src/templates/frontend/src/api/generated/client.gen.ts:6` | Stub comment "from your Django API schema" (mirror of `init.ts:381`). | Neutral text. |

### 11. CLI-facing docs (adjacent to the CLI, not part of it)

| Site | Today | With three backends |
|---|---|---|
| `README.md` | Headline "Django or Express + React framework", the "Two backends, one API" bullet, and the quick-start examples enumerate two. | Three named. |
| `docs/docs/guides/choosing-a-backend.md` | Comparison table and "Pick Django / Pick Express" sections assume two. The "What Is Identical" section states the contract a third backend must reproduce (URLs, pagination, error bodies, snake_case, operation IDs — so the generated frontend stays identical). | Third column and pick section. The "What Is Identical" contract is the compatibility bar for FastAPI and stays in force. |
| `docs/docs/stack/backend.md`, `docs/docs/stack/backend-express.md`, `docs/docs/commands/init.md`, `docs/docs/configuration/project-config.md`, `docs/docs/getting-started/quick-start.md`, `docs/docs/guides/{authentication,creating-resources,deployment,project-structure,testing}.md` | One stack page per framework and enumerations of two across the guides. | A third stack page and updated enumerations. |

---

## Sites that already generalize (do not "fix" these)

- Config storage (`src/utils/paths.ts:110`) — a framework string already round-trips.
- `backendTemplateDir()` / `resourceTemplateDir()` (`src/utils/scaffold.ts:44-51`) — keyed by framework name.
- `resourcePrismaTemplate()` (`src/utils/scaffold.ts:60-62`) — keyed to Express already.
- `src/commands/setup.ts` — already passes the framework value through.
- The `eq` Handlebars helper (`src/utils/template.ts:8`) — equality branching in templates is already available.

## Backward compatibility

Projects generated before Express support have no `backend.framework` field.
That absence must keep reading as `django` (`src/utils/paths.ts:56`), so every
existing project keeps working untouched. This is the one place the value
"django" may appear as a default — never as an else-branch in behaviour
selection.

## Out of scope for this record

Any code or template change. This document records the shape of the problem;
the sprint implements the decision above. The CLI's own test suite is
unchanged by this record — the diff alters no command behaviour.
