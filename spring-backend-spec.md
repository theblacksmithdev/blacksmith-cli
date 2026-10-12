# Spring Boot Backend: Parity Contract and Decisions

## What this document is

The parity contract and the open decisions for the fourth backend, Spring Boot. The project plan holds sequencing. This holds the detail, so tickets can be written against a specification instead of against a paragraph in a roadmap.

It is written before the sprint opens on purpose. Several of the decisions below change the size of the work rather than the shape of a ticket, and settling them after the board exists means rewriting tickets.

This revision adds a recommendation to each open decision, a sixth decision the first draft missed (the development database), the parity traps that Spring's defaults set, and a ticket 0 that has already landed in the CLI. The recommendations are proposals. The team still makes the calls.

## What Spring Boot is here

The fourth backend, selected with `--backend spring`. Django, Express and FastAPI cover Python and Node. Spring Boot brings the JVM and the audience that comes with it, which is the largest single pool of professional backend engineers and the one the other three do not reach.

The alternatives assessed were NestJS and Laravel as the two strongest cases, ASP.NET Core and Rails as the next tier, and Go, Fastify and Hono as either convention-inventing or covering ground the CLI already covers. Spring Boot was the team's call and this document works from it.

## The parity contract

This is the part that is not negotiable, because it is the reason one React frontend and one generated API client currently serve three different backends. Spring Boot satisfies all of it or it gets its own frontend, which is a different phase rather than a bigger ticket.

- **Error bodies.** Django REST Framework's shape: a 400 whose body is `{"field": ["message"]}` for validation failures, matching bodies for 401 and 403, and DRF's wording for 404. Spring's default is an RFC 7807 problem detail document, so this is written by hand rather than configured.
- **Pagination.** DRF's envelope, with `count`, `next`, `previous` and `results`. Spring Data's default page serialisation does not match it.
- **Auth.** The same `access` and `refresh` token response and the same `/api/auth/...` route names the other three backends serve, so the frontend's auth flow does not learn a second shape.
- **Documentation paths.** The schema at `/api/schema/`, interactive docs at `/api/docs/`, ReDoc at `/api/redoc/`. The documentation generator's own defaults point somewhere else and its UI is a different tool, so both are configured. The exported document has to be OpenAPI 3.0 in the form the frontend generator reads.
- **Offline schema export.** The frontend client regenerates without a server listening, the way `blacksmith sync` does today for all three.

Every line above is a condition someone can check by using the product. When the parity work is done, the honest measure is that the generated frontend for a Spring project is identical to the one for a FastAPI project except where the resource names differ.

## Where Spring's defaults break parity

Each of these looks fine until the frontend breaks. They are where most of the parity effort goes, and each one is a test in the Spring backend's own suite.

- **Offline export is not offline by default.** springdoc's Gradle plugin starts the application and fetches the document over HTTP. Exporting without a server means a task or test that boots the application context without a web server and writes the document to a file. That costs a JVM start on every `blacksmith sync` and on every save the `dev` sync watcher reacts to, which feeds decision 4.
- **Error responses leak into the schema.** springdoc adds the responses declared by `@ControllerAdvice` handlers to every operation. This is FastAPI's 422 problem again: in Phase 2 it changed the error type of every generated hook and broke the frontend's `tsc`. Turn it off (`springdoc.override-with-generic-response=false`) and declare responses explicitly.
- **Operation IDs.** springdoc names operations after the Java method. The generated hooks are named after operation IDs, so every route sets DRF-style IDs explicitly (`posts_list`, `posts_retrieve`, `posts_partial_update`).
- **A non-numeric id is a 400, not a 404.** A `Long` path variable given `abc` fails type conversion with a 400. DRF answers 404 `{"detail": "Not found."}`, and the frontend passes ids as strings from the URL. Map the type-mismatch exception to DRF's 404, as Phase 2 did for FastAPI.
- **PATCH cannot tell absent from null.** Plain Java request types bind a missing field and an explicit `null` to the same value. Pydantic's `exclude_unset` gave FastAPI this distinction for free. Spring needs `JsonNullable` (or a map-backed patch type) on the partial-update request.
- **Validation wording.** Bean Validation says "must not be blank". DRF says "This field may not be blank." for a blank value and "This field is required." for a missing one. The messages are mapped by hand, and required versus blank needs both `@NotNull` and `@NotBlank`.
- **Timestamps.** Use `Instant` so the JSON carries a `Z`, like the other three. `LocalDateTime` serialises without a zone.
- **Schema version.** Pin springdoc's output to OpenAPI 3.0 (`springdoc.api-docs.version=openapi_3_0`) so a library upgrade cannot change the format the frontend generator reads.

## The stack this implies

Language and build tool are decisions, listed below. Everything else follows from the parity contract rather than from preference: a web layer, an ORM-backed data layer, request validation that produces field-level errors from a single source, an auth layer able to issue the token shape above, an OpenAPI generator that reads the code rather than a hand-written document, and a migration tool. Testing is part of the contract, not an afterthought: a test suite that runs offline and a migration check that fails when a model changes without a migration.

## Shape of a generated project

A Gradle wrapper checked into the repository, so a JDK is the only prerequisite the CLI has to check for. One application configuration file. A source tree with the resource packages the other backends get from `make:resource`, which here means an entity, a repository, request and response types, a service, a controller and a migration. A migration directory that is the only thing in the project allowed to create or change tables. A test tree that builds its database by replaying migrations, copying the precedent Phase 2 set for FastAPI.

Two packaging details to carry into the template ticket. `gradle/wrapper/gradle-wrapper.jar` is binary and `gradlew` must stay executable. The CLI's CI already fails when a template file is missing from the npm tarball, but nothing checks the executable bit, so `init` sets it explicitly after rendering.

## Decisions

### 1. Java or Kotlin. Recommended: Java

Every template file and both AI skills depend on the answer. Kotlin is the more common choice for new Spring work and generates less ceremony. Java has the larger talent pool, and a scaffolder's audience is part of the product.

The recommendation follows the audience argument. Two further points support it. Kotlin with JPA needs compiler plugins (`kotlin-jpa`, `allopen`) before entities behave, which is configuration a newcomer cannot debug and a common place for AI-written code to go wrong. Java 17+ records remove most of the ceremony from the request and response types, which are the bulk of a resource.

### 2. Gradle or Maven. Recommended: Gradle with the checked-in wrapper

Gradle with the wrapper keeps the JDK as the only prerequisite. Maven would add a second install check to the CLI's prerequisite list.

"Only the JDK" needs two qualifications in the CLI and the docs. Spring Boot 3 needs JDK 17 or newer, so the prerequisite check reads the version rather than testing that `java` exists. The wrapper also downloads Gradle on its first run, so the first `init` needs a network connection and is noticeably slower than later runs.

### 3. Flyway or Liquibase. Recommended: Flyway

The migration tool owns the schema. Nothing creates tables at startup, and `make:resource` runs a real migration. The FastAPI phase paid this price once already with Alembic and the same discipline applies here rather than being rediscovered.

Neither tool generates a migration from the entities the way Alembic's autogenerate does, and this changes two things:

- `make:resource` writes the resource's migration SQL from its template, which it can do because the columns are known.
- A user who adds a field writes the SQL by hand. The skills and docs say so, and they show the workflow.

The missing-migration check still holds. The test profile runs Flyway and then Hibernate with `ddl-auto=validate`, which fails at startup when an entity and the migrated schema disagree. Flyway is preferred because its migrations are plain SQL files a reader can review. Liquibase's diff plugin is the only route to generated changelogs, and it is brittle enough that it would be a liability in a scaffold.

### 4. The dev loop promise. Recommended: build a real dev loop, and promise seconds rather than instant

On the existing three, saving a file brings the server back in a second or two. A JVM backend reloads behind a build daemon and a cold start is measured in tens of seconds. Either the phase builds Spring a real dev loop or it documents a restart and agrees that Spring users get a slower experience than everyone else.

The recommended loop uses `spring-boot-devtools`, which restarts the application in a few seconds once the classes change. Something has to recompile those classes. An IDE does that, but `blacksmith dev` runs from a terminal, so it starts two processes for a Spring backend: a continuous compile (`./gradlew compileJava --continuous`) and the application (`./gradlew bootRun`).

The promise to users is then: a slow first start, then a few seconds after each save. That is slower than the other three, and the stack docs say so plainly.

The cold-start open question has the same answer. `dev` prints that the backend is starting and polls the port until it answers, so forty seconds of compilation never reads as a hang. The schema-export cost from the parity section lands here too. The sync watcher re-exports after each restart rather than on each save, so a burst of edits costs one export.

### 5. The CI job. Recommended: a dedicated Spring job, run in parallel

The first draft assumed an existing per-framework backend job. There is none. The CLI's CI today runs typecheck, vitest and the build on Node 20 and 22, and checks the npm tarball's contents. Generated backends are exercised only by unit tests that mock the toolchain, and by manual end-to-end runs.

So the decision is whether Spring gets the first real-backend job. It should, because a JVM template cannot be verified by mocks. The job:

1. Sets up JDK 17 and caches Gradle.
2. Scaffolds a fullstack Spring project and runs `make:resource`.
3. Runs `gradle test`.
4. Syncs the frontend client and runs `tsc` on the frontend.

Run in parallel with the existing jobs, it adds its own duration to the pipeline's wall time rather than adding to the sum. With a warm Gradle cache that should be a few minutes. The same job shape can later cover the other three, which closes a gap that exists today.

### 6. The development and test database. Recommended: H2 in PostgreSQL mode

This was missing from the first draft. The other three backends develop and test on SQLite and deploy on Postgres. SQLite with Hibernate needs a community dialect. Testcontainers would add Docker as a second prerequisite, which breaks decision 2's "JDK only". H2 in PostgreSQL compatibility mode keeps the JDK as the only prerequisite. Migrations are written in the Postgres-compatible subset of SQL, so the same files run in development, in tests and in production.

The choice decides which SQL dialect every migration is written in, so it is settled before the template ticket.

## What Spring must not do

- Create or alter tables at startup. That is the migration tool's job, and a scaffold that quietly creates tables teaches the wrong habit from the first command.
- Invent its own error or pagination shape and leave the frontend to handle both.
- Need documentation the other three backends do not need.
- Change what Django, Express or FastAPI generate. A regression in an existing backend is a defect, not a trade.

## Ticket 0: one table per framework (landed)

Before this revision, the CLI still decided per framework with two-way branches: 37 sites across 9 files. `init`'s prerequisite check treated every backend that was not Express as Python, so a Spring project would have demanded Python 3.

These are now table lookups. `src/utils/backend-toolchains.ts` holds a `BackendToolchain` per framework. It covers:

- the label and the runtime
- the initial and setup migrations
- the dev server, the start command and the sync watcher's file filter
- the schema export and its file name
- the build step and whether the backend serves ReDoc

`src/utils/runtimes.ts` holds what each runtime needs: its prerequisites, its install steps, its tests and its `setup:backend` preparation. The resource generators, the `backend` passthrough and the AI skill profiles were already tables.

The tables are keyed on `BackendFramework`, so adding `'spring'` to that type makes the compiler list every table that still needs a Spring entry. Spring then needs a `jvm` runtime entry. No command is edited to add the fourth backend.

The same change fixed two FastAPI gaps: `blacksmith build` no longer runs `collectstatic` on FastAPI, and `eject` names FastAPI and Uvicorn. It also made `init` sync Django offline, as it already did for Express and FastAPI.

The Handlebars templates still branch on `isDjango`, `isExpress` and `isFastapi`. That is content per framework, not a decision, and a Spring template set brings its own content.

## Open questions

- Does the frontend need anything Spring-specific at all once parity is met, or is it byte-identical to the FastAPI one? Only the parity work answers this. The traps listed above are the likely places for a difference to appear.
- Studio's runner starts a Python virtual environment and labels the backend Django in its UI. Recommended answer: this belongs to the Studio stream (`studio-backend-inventory.md`), not to this phase. That stream's first ticket, "run any backend", should be designed for a JVM runner from the start rather than as a venv runner with branches.

## Out of scope

Kotlin multiplatform, native images, cloud platform deployment templates, Spring Cloud, messaging, an admin UI, and anything that is a Spring feature rather than something a scaffolded project needs to be considered supported.
