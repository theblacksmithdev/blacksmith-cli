# Spring Boot Backend: Parity Contract and Decisions

## What this document is

The parity contract and the open decisions for the fourth backend, Spring Boot. The project plan holds sequencing. This holds the detail, so tickets can be written against a specification instead of against a paragraph in a roadmap.

It is written before the sprint opens on purpose. Several of the decisions below change the size of the work rather than the shape of a ticket, and settling them after the board exists means rewriting tickets.

The second revision added a recommendation to each open decision, a sixth decision the first draft missed (the development database), the parity traps that Spring's defaults set, and a ticket 0 that landed in the CLI. This third revision records that the scaffold was built on those recommendations (ticket 1), with what building it measured and what it left for the `make:resource` ticket. The fourth records ticket 2: `make:resource`, the skills, coverage, and the verification on PostgreSQL, clean Linux machines and the generated CI.

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

All six were taken as recommended. Ticket 1 is built on them.

### 1. Java or Kotlin. Taken: Java

Every template file and both AI skills depend on the answer. Kotlin is the more common choice for new Spring work and generates less ceremony. Java has the larger talent pool, and a scaffolder's audience is part of the product.

The recommendation follows the audience argument. Two further points support it. Kotlin with JPA needs compiler plugins (`kotlin-jpa`, `allopen`) before entities behave, which is configuration a newcomer cannot debug and a common place for AI-written code to go wrong. Java 17+ records remove most of the ceremony from the request and response types, which are the bulk of a resource.

### 2. Gradle or Maven. Taken: Gradle with the checked-in wrapper

Gradle with the wrapper keeps the JDK as the only prerequisite. Maven would add a second install check to the CLI's prerequisite list.

"Only the JDK" needs two qualifications in the CLI and the docs. Spring Boot 3 needs JDK 17 or newer, so the prerequisite check reads the version rather than testing that `java` exists. The wrapper also downloads Gradle on its first run, so the first `init` needs a network connection and is noticeably slower than later runs.

### 3. Flyway or Liquibase. Taken: Flyway

The migration tool owns the schema. Nothing creates tables at startup, and `make:resource` runs a real migration. The FastAPI phase paid this price once already with Alembic and the same discipline applies here rather than being rediscovered.

Neither tool generates a migration from the entities the way Alembic's autogenerate does, and this changes two things:

- `make:resource` writes the resource's migration SQL from its template, which it can do because the columns are known.
- A user who adds a field writes the SQL by hand. The skills and docs say so, and they show the workflow.

The missing-migration check still holds. The test profile runs Flyway and then Hibernate with `ddl-auto=validate`, which fails at startup when an entity and the migrated schema disagree. Flyway is preferred because its migrations are plain SQL files a reader can review. Liquibase's diff plugin is the only route to generated changelogs, and it is brittle enough that it would be a liability in a scaffold.

### 4. The dev loop promise. Taken: build a real dev loop, and promise seconds rather than instant

On the existing three, saving a file brings the server back in a second or two. A JVM backend reloads behind a build daemon and a cold start is measured in tens of seconds. Either the phase builds Spring a real dev loop or it documents a restart and agrees that Spring users get a slower experience than everyone else.

The recommended loop uses `spring-boot-devtools`, which restarts the application in a few seconds once the classes change. Something has to recompile those classes. An IDE does that, but `blacksmith dev` runs from a terminal, so it starts two processes for a Spring backend: a continuous compile (`./gradlew compileJava --continuous`) and the application (`./gradlew bootRun`).

The promise to users is then: a slow first start, then a few seconds after each save. That is slower than the other three, and the stack docs say so plainly.

The cold-start open question has the same answer. `dev` prints that the backend is starting and polls the port until it answers, so forty seconds of compilation never reads as a hang. The schema-export cost from the parity section lands here too. The sync watcher re-exports after each restart rather than on each save, so a burst of edits costs one export.

### 5. The CI job. Taken: a dedicated Spring job, run in parallel

The first draft assumed an existing per-framework backend job. There is none. The CLI's CI today runs typecheck, vitest and the build on Node 20 and 22, and checks the npm tarball's contents. Generated backends are exercised only by unit tests that mock the toolchain, and by manual end-to-end runs.

So the decision is whether Spring gets the first real-backend job. It should, because a JVM template cannot be verified by mocks. The job:

1. Sets up JDK 17 and caches Gradle.
2. Scaffolds a fullstack Spring project and runs `make:resource`.
3. Runs `gradle test`.
4. Syncs the frontend client and runs `tsc` on the frontend.

Run in parallel with the existing jobs, it adds its own duration to the pipeline's wall time rather than adding to the sum. With a warm Gradle cache that should be a few minutes. The same job shape can later cover the other three, which closes a gap that exists today.

### 6. The development and test database. Taken: H2 in PostgreSQL mode

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

## Ticket 1: the scaffold (landed)

`blacksmith init --backend spring` generates a Spring Boot 4.1 project on Java 17, Gradle 9.8 and springdoc 3.1. It meets the parity contract for everything the scaffold has, which is auth:

- DRF error bodies, including "Not found." for unknown routes and non-numeric ids.
- The `/api/auth/...` routes and token shape.
- The three documentation URLs.
- An offline export through `./gradlew exportOpenApi`.

Every CLI command works on it except `make:resource`, which refused with a clear message before writing anything until ticket 2.

What building it measured, on a machine with Gradle and the dependencies already cached:

| | Time |
|---|---|
| `init`, fullstack | about 40 seconds |
| `dev`, backend answering | about 7 seconds |
| Save to change live | about 4 seconds (the restart itself takes under half a second) |
| Save to frontend client regenerated | about 9 seconds |
| `exportOpenApi` | about 5 seconds |

A first `init` on a clean machine adds the Gradle download, around 130 MB, plus the dependencies.

Traps from the parity list that the scaffold met, and how:

- springdoc does not read Jackson's naming strategy. With Spring Boot 4 the API is on Jackson 3 and springdoc's model resolver is on Jackson 2. `OpenApiConfig` registers a snake_case `ModelResolver`, and `OpenApiDocumentTest` pins the result.
- Error responses are kept out of the document with `springdoc.override-with-generic-response: false`, and a test pins that too.
- The 400-versus-404 trap for non-numeric ids is handled in `ApiExceptionHandler`.

Left for the `make:resource` ticket:

- **Required response fields.** springdoc marks a property required only when it carries a constraint. drf-spectacular marks every read field required. The generated TypeScript types make the difference visible: `post.title` would be `string | undefined`. Resource response records need a rule, either per field (`@Schema(requiredMode = REQUIRED)`) or as a schema customizer.
- **Pagination.** DRF's envelope, and a component name per resource (`PaginatedPostList`), which a generic `PageResponse<T>` will not produce.
- **PATCH absent versus null** (`JsonNullable`).
- **The Spring conventions skill**, now that the code it describes exists.
- **`--coverage`.** JaCoCo is not set up yet, so `blacksmith test --coverage` warns and runs the tests without it.

Found along the way, and not Spring's: the generated `vite.config.ts` hard-coded port 5173, so the frontend port chosen at `init` was ignored on every backend. Fixed in ticket 2.

## Ticket 2: `make:resource` and full support (landed)

`blacksmith make:resource BlogPost` on a Spring project writes:
- an `app.blogposts` package, holding the entity, repository, service and controller;
- the response, request, PATCH and page records, in `dto/`;
- a JUnit API test;
- the next Flyway migration, numbered one past the highest version present.

It then compiles the backend and syncs the frontend. Nothing is registered, because component scanning finds the controller. The package name is the plural with the words run together, since Java packages do not take underscores by convention. The table and the URL stay snake_case.

How each item left by ticket 1 landed:

- **Required response fields.** A schema customizer, `config/RequiredResponseFields`, marks every property of every schema reachable from a response required, which is drf-spectacular's rule. Request schemas keep springdoc's rule, where only constrained properties are required. The rule applies to the scaffold's own `User` and `TokenPair` too, which had every field optional before. `OpenApiDocumentTest` pins it.
- **Pagination.** `app.pagination.Pagination` matches DRF on four points: a page size of 20, a 1-based `?page=`, absolute links, and no `page=1` on the first page. `Ordering` reads `?ordering=`, falls back to the default for an unknown field, and breaks ties on id. Each resource has its own `Paginated<Name>List` record, so the component name matches the other backends.
- **PATCH.** Fields are `JsonNullable` (jackson-databind-nullable 0.2.12, the first release with a Jackson 3 module). Constraints sit inside the type argument, so they validate only a field that was sent. `FieldErrors` now returns one DRF message per field:
  - "This field may not be null." for a null that was sent;
  - "This field is required." for a missing field;
  - "This field may not be blank." for an empty one;
  - "Ensure this field has no more than N characters." for `@Size`.

  Telling a sent null from a missing field is done by reading the `JsonNullable` off the request record. Hibernate Validator's path does not mark the unwrapped value as a container element, so the path alone cannot tell them apart.
- **Skills.** `spring` covers the conventions, contract, errors, PATCH, pagination and testing. `spring-jpa` covers entities, Flyway, repositories and transactions.
- **`--coverage`.** It runs `./gradlew test jacocoTestReport` (JaCoCo 0.8.15) and prints the report-wide line coverage from the XML. Generated CI runs the same.

Also fixed along the way:
- **Symlinked output paths.** `exportOpenApi` failed when the output directory's path ran through a symlink (`/tmp` on macOS), because `Files.createDirectories` refuses one.
- **Development log noise.** `bootRun` now silences Tomcat's "Socket accept failed", which a DevTools restart can race into, and Flyway's notice that H2 is newer than the versions it has verified. Production logging is unchanged.
- **The frontend port chosen at `init`.** It now reaches Vite's port and proxy and every backend's default CORS origin; before, only Express's got it. `dev` passes the port it settled on to Vite.

Verified, beyond the unit and end-to-end suites:

- **Parity.** The generated TypeScript for a `Post` resource (`Post`, `PostRequest`, `PatchedPostRequest`, `PaginatedPostList` and the operation data types) is identical to FastAPI's, character for character.
- **The generated suite.** A project with three resources runs 76 JUnit tests. One of the resources is `Order`, which is a JPQL keyword, used as an entity name.
- **PostgreSQL 17.**
  - The same 76 tests pass against it, with the datasource overridden by environment variable.
  - All four migrations apply, and Hibernate's validation accepts them.
  - The production jar migrates an empty schema and serves the API.
- **Clean Linux machines** (Docker, arm64, no Gradle cache), on JDK 21 and on JDK 25:

  | Step | Result |
  |---|---|
  | `init`, fullstack | about 2 minutes, including the Gradle download, the dependencies and `npm install` |
  | `make:resource` | 15 seconds |
  | `test --coverage` | passes, with 87.7% backend line coverage |
  | `build` | produces the jar |

- **Generated CI.** The workflow runs green under `act` 0.2.89: JUnit with JaCoCo, `bootJar`, the schema export, client generation, then the frontend tests and build. `act`'s git library cannot parse the `gradle/actions` `v4` tag object, so the local run pinned it to a commit. GitHub resolves the tag normally.

Not done, deliberately:
- **Windows.** The CLI is Unix-only for every backend, not just this one. The prerequisites page now says macOS, Linux, or WSL.
- **Studio**, as the open question below says.

## Open questions

- Does the frontend need anything Spring-specific at all once parity is met, or is it byte-identical to the FastAPI one? Answered: nothing Spring-specific. The scaffold's frontend typechecks, builds and passes unchanged, and a resource's generated types are identical to FastAPI's.
- Studio's runner starts a Python virtual environment and labels the backend Django in its UI. Recommended answer: this belongs to the Studio stream (`studio-backend-inventory.md`), not to this phase. That stream's first ticket, "run any backend", should be designed for a JVM runner from the start rather than as a venv runner with branches.

## Out of scope

Kotlin multiplatform, native images, cloud platform deployment templates, Spring Cloud, messaging, an admin UI, and anything that is a Spring feature rather than something a scaffolded project needs to be considered supported.
