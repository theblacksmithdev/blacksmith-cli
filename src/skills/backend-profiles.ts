import type { BackendFramework } from '../utils/paths.js'
import type { SkillContext } from './types.js'
import { BACKEND_TOOLCHAINS } from '../utils/backend-toolchains.js'
import { DJANGO_PARADIGMS, EXPRESS_PARADIGMS, FASTAPI_PARADIGMS, SPRING_PARADIGMS } from './backend-paradigms.js'

/**
 * What the framework-neutral skills (project overview, CLI, guidelines) say
 * about the backend. One entry per framework, so a skill never re-derives
 * framework facts with its own conditionals.
 */
export interface BackendProfile {
  name: string
  /** The backend's subtree inside `backend/` of a fullstack project. */
  tree: string
  /** The project root of a backend-only project. */
  rootTree: string
  /** What `blacksmith build` does to the backend. */
  build: string
  /** The first step of adding a feature by hand. */
  defineFeature: string
  /** What `make:resource` generates and wires, as markdown bullets. */
  resourceSteps: string
  /** How `blacksmith sync` exports the OpenAPI schema. */
  schemaExport: string
  /** Backend code style, for the AI guidelines. */
  codeStyle: string
  /** Where the backend's toolchain lives, for the AI guidelines. */
  toolchain: string
  /** One-line backend paradigm, for the programming-paradigms summary. */
  paradigmSummary: string
  /** The backend section of the programming-paradigms skill. */
  paradigms: string
  /** Language-specific clean-code rules for the backend, as a markdown section. */
  languageRules: string
}

export const BACKEND_PROFILES: Record<BackendFramework, BackendProfile> = {
  django: {
    name: BACKEND_TOOLCHAINS.django.label,
    tree: `│   ├── apps/             # Django apps (one per resource)
│   ├── config/           # Django settings, urls, wsgi/asgi
│   ├── utils/            # Shared backend utilities
│   ├── manage.py
│   └── venv/             # Python virtual environment`,
    rootTree: `├── apps/
├── config/
├── utils/
├── manage.py
├── venv/`,
    build: 'collectstatic',
    defineFeature: 'Define models, serializers, and viewsets',
    resourceSteps: `- \`apps/blog_posts/\` — model, serializer, viewset, urls, admin, tests
- Wires the app into \`INSTALLED_APPS\` and \`config/urls.py\`
- Runs \`makemigrations\` and \`migrate\``,
    schemaExport: 'manage.py spectacular',
    codeStyle: 'Follow PEP 8. Use Django and DRF conventions. Docstrings on models, serializers, and non-obvious view methods',
    toolchain: 'Python venv: `venv/` in the backend directory — always use `./venv/bin/python` or `./venv/bin/pip`, or `blacksmith backend <command>` for `manage.py`',
    paradigmSummary: '**Backend (Django/Python): OOP with functional touches.** Classes for structure, pure functions for logic, no mutation where avoidable.',
    paradigms: DJANGO_PARADIGMS,
    languageRules: `### Python-Specific (Django)
- Use \`f-strings\` for string formatting, not \`.format()\` or \`%\`
- Use list/dict/set comprehensions when they are clearer than loops — but don't nest them
- Use \`dataclasses\` or typed dicts for structured data outside of Django models
- Keep view methods thin — push business logic into model methods, serializer validation, or service functions
- Use \`get_object_or_404\` instead of manual \`try/except DoesNotExist\``,
  },
  express: {
    name: BACKEND_TOOLCHAINS.express.label,
    tree: `│   ├── src/
│   │   ├── config/       # env, Zod, OpenAPI registry
│   │   ├── db/           # Prisma client
│   │   ├── middleware/   # auth, validation, error handling
│   │   ├── modules/      # one folder per resource
│   │   └── utils/        # errors, pagination, tokens
│   ├── prisma/           # schema.prisma and migrations
│   └── package.json`,
    rootTree: `├── src/
├── prisma/
├── package.json`,
    build: 'tsc build',
    defineFeature: 'Define the Prisma model, Zod schemas, service, and routes',
    resourceSteps: `- \`src/modules/blog-posts/\` — schemas, service, controller, routes, tests
- Adds the Prisma model and the User back-relation to \`prisma/schema.prisma\`
- Mounts the router in \`src/modules/index.ts\`
- Runs \`prisma migrate dev\``,
    schemaExport: 'npm run openapi',
    codeStyle: 'TypeScript strict mode. Follow the module layout in the `express` skill: thin controllers, logic in services, Zod schemas as the contract',
    toolchain: 'Node backend: run npm scripts with `blacksmith backend <command>` (e.g. `blacksmith backend exec prisma studio`)',
    paradigmSummary: '**Backend (Express/TypeScript): functional modules.** Plain functions in services, plain data between layers, no mutation.',
    paradigms: EXPRESS_PARADIGMS,
    languageRules: `### TypeScript-Specific (Express)
- Services take plain arguments and return plain data — never \`req\` or \`res\`
- Infer types from Zod schemas (\`z.infer<typeof Schema>\`) instead of declaring them twice
- Throw \`ApiError\` for expected failures; let Express 5 forward everything else to the error handler`,
  },
  fastapi: {
    name: BACKEND_TOOLCHAINS.fastapi.label,
    tree: `│   ├── app/
│   │   ├── main.py       # FastAPI app; routers mounted here
│   │   ├── db.py         # engine, session, Base, User
│   │   ├── routers/      # auth endpoints
│   │   └── <resource>/   # one package per resource
│   ├── migrations/       # Alembic migrations
│   ├── tests/
│   └── venv/             # Python virtual environment`,
    rootTree: `├── app/
├── migrations/
├── tests/
├── venv/`,
    build: 'nothing to build',
    defineFeature: 'Define the SQLAlchemy model, Pydantic schemas, service, and router',
    resourceSteps: `- \`app/blog_posts/\` — model, schemas, service, router; \`tests/test_blog_posts.py\`
- Mounts the router in \`app/main.py\`
- Runs \`alembic revision --autogenerate\` and \`alembic upgrade head\``,
    schemaExport: 'scripts.py export-openapi',
    codeStyle: 'Follow PEP 8 with type hints everywhere. Follow the package layout in the `fastapi` skill: thin routers, logic in services, Pydantic schemas as the contract',
    toolchain: 'Python venv: `venv/` in the backend directory — use `blacksmith backend <module>` to run `python -m <module>` in it (e.g. `blacksmith backend alembic upgrade head`)',
    paradigmSummary: '**Backend (FastAPI/Python): functions and dependency injection.** Plain functions for endpoints and services, classes only for models and schemas.',
    paradigms: FASTAPI_PARADIGMS,
    languageRules: `### Python-Specific (FastAPI)
- Use \`f-strings\` for string formatting, not \`.format()\` or \`%\`
- Use list/dict/set comprehensions when they are clearer than loops — but don't nest them
- Type-hint every function signature; FastAPI validates and documents from them
- Keep routers thin — queries and writes belong in the resource's \`service.py\`
- Use SQLAlchemy 2.0 \`select()\`, not the legacy \`session.query()\` API`,
  },
  spring: {
    name: BACKEND_TOOLCHAINS.spring.label,
    tree: `│   ├── src/main/java/app/
│   │   ├── auth/         # auth endpoints, tokens, request filter
│   │   ├── config/       # security, OpenAPI, settings
│   │   ├── errors/       # DRF-shaped error bodies
│   │   └── users/        # User entity and repository
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/ # Flyway migrations
│   ├── src/test/java/app/
│   └── build.gradle`,
    rootTree: `├── src/main/java/app/
├── src/main/resources/
├── src/test/java/app/
├── build.gradle`,
    build: 'bootJar',
    defineFeature: 'Define the JPA entity, Flyway migration, request and response records, service, and controller',
    resourceSteps: `- Not available for Spring Boot yet: write the package by hand under \`src/main/java/app/\``,
    schemaExport: 'gradlew exportOpenApi',
    codeStyle: 'Java 17. Constructor injection, records for request and response types, thin controllers, logic and transactions in services',
    toolchain: 'Gradle wrapper: run tasks with `blacksmith backend <task>` (e.g. `blacksmith backend test`), which runs `./gradlew <task>` in the backend directory',
    paradigmSummary: '**Backend (Spring Boot/Java): layered OOP.** Injected classes for the layers, immutable records for the data between them.',
    paradigms: SPRING_PARADIGMS,
    languageRules: `### Java-Specific (Spring Boot)
- Constructor injection with \`final\` fields; never field \`@Autowired\`
- \`record\`s for request and response types; entities stay inside the service layer
- \`Optional\` instead of \`null\` for "may be absent", unwrapped at the service's edge
- \`var\` only where the type is obvious from the right-hand side
- Change the schema with a new \`V<n>__description.sql\` migration; Hibernate only validates it`,
  },
}

/** The profile for the skill's project. Projects without a framework are Django. */
export function backendProfile(ctx: SkillContext): BackendProfile {
  return BACKEND_PROFILES[ctx.backendFramework ?? 'django']
}
