---
sidebar_position: 5
---

# Spring Boot Backend

The fourth backend, selected with `blacksmith init --backend spring`. It brings the
JVM: Java 17, Spring Boot, JPA for the database, Flyway for migrations and Spring
Security for JWT auth. It speaks exactly the same HTTP contract as the Django,
Express and FastAPI backends, so the React frontend is identical whichever you pick.
See [Choosing a Backend](../guides/choosing-a-backend.md) for how the four compare.

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Java 17 or newer (compiled for 17) |
| Build | Gradle, through the checked-in wrapper (`./gradlew`) |
| Framework | Spring Boot 4 with Spring Web MVC |
| Validation | Bean Validation (`@NotBlank`, `@Email`) |
| ORM | Spring Data JPA (Hibernate) |
| Database | H2 in PostgreSQL mode in development, Postgres in production |
| Migrations | Flyway |
| Auth | Spring Security, stateless JWT (HS256) with BCrypt password hashing |
| Docs UI | Swagger UI at `/api/docs/`, ReDoc at `/api/redoc/` (springdoc-openapi) |
| Tests | JUnit 5 + MockMvc |

The only prerequisite is a JDK. The wrapper downloads Gradle on its first run,
so the first `init` needs a network connection and takes a few minutes.

## Project Structure

```
backend/
├── src/main/java/app/
│   ├── Application.java       # the Spring Boot entry point
│   ├── auth/                  # auth endpoints, tokens, the bearer-token filter
│   │   └── dto/               # request and response records
│   ├── config/                # security, OpenAPI, the app.* settings
│   ├── errors/                # DRF-shaped error bodies
│   ├── docs/                  # ReDoc page
│   ├── pagination/            # DRF's page envelope and ordering
│   ├── users/                 # User entity and repository
│   └── posts/                 # one package per resource (make:resource)
├── src/main/resources/
│   ├── application.yml        # settings; ${...} values come from .env
│   └── db/migration/          # Flyway migrations: V1__create_users.sql, ...
├── src/test/java/app/         # API tests, the migration check, the schema export
├── src/test/resources/application-test.yml
├── build.gradle
├── gradlew
└── .env
```

## Package Anatomy

Each resource is a package under `app`, split by responsibility.
`blacksmith make:resource BlogPost` creates one, `app.blogposts`, with its JUnit
test and the next Flyway migration:

| Class | Responsibility |
|-------|----------------|
| Entity | JPA `@Entity`, mapped onto a table a migration created |
| Repository | Spring Data `JpaRepository` |
| Request and response records | Validation **and** the OpenAPI contract |
| Service | Business logic and transactions; the only layer that uses the repository |
| Controller | Endpoints: bind and validate the request, call the service, return a record |

Classes take their dependencies through the constructor, and entities never leave
the service: controllers return records. Spring finds controllers by component
scanning, so a new package needs no registering. Projects created with `--ai` get
the `spring` and `spring-jpa` skills, which describe these conventions.

## The API Contract

The Spring backend reproduces Django REST Framework's wire format, which is what
lets one React codebase work against any backend.

**Errors**: `ApiExceptionHandler` answers every failure in DRF's shape, never with
Spring's RFC 7807 problem document:

```json
{ "detail": "Not found." }
{ "email": ["This field is required."], "password": ["This field may not be blank."] }
```

A path id that is not a number answers 404, as DRF does, not 400. Throw
`ApiException` for expected failures.

**Lists** use DRF's envelope, `{ count, next, previous, results }`, 20 rows a page
with absolute `next` and `previous` links (`app.pagination.Pagination`), and DRF's
`?ordering=-created_at` (`Ordering`). Each resource has its own
`Paginated<Name>List` record, so the schema name matches the other backends.

**PATCH** bodies wrap each field in `JsonNullable`, which tells a field left out
(keep the current value) from one sent as `null`. A field that is not nullable
rejects an explicit `null` with "This field may not be null.", as DRF does.

**Field names** are snake_case in both the API and the OpenAPI document. The Java
code stays camelCase: `application.yml` sets Jackson's naming strategy, and
`OpenApiConfig` documents the same names. **Timestamps** are `Instant`, serialized
in UTC with a `Z`. **URLs** keep their trailing slash: `/api/auth/me/`.

**Operation IDs** follow drf-spectacular's convention (`auth_me_retrieve`,
`auth_me_partial_update`), set with `@Operation(operationId = ...)` on each
endpoint. That is what gives the generated React hooks the same names on every
backend. Error responses are left out of the document, so the generated hooks'
error types match the other backends. Every field of a response schema is marked
required (`config/RequiredResponseFields`), as drf-spectacular does, so response
types never read `string | undefined`.

## OpenAPI Without a Server

```bash
./gradlew exportOpenApi -Pout=../frontend/_schema.json
```

This runs the application in-process through MockMvc and writes the OpenAPI 3.0
document to a file. No server listens, so [`blacksmith sync`](../commands/sync.md)
and CI both work from a clean checkout. A run takes a few seconds, the cost of
starting a JVM. At runtime the same document is served at `/api/schema/`.

## Migrations

Flyway owns the schema. Migrations are plain SQL files in
`src/main/resources/db/migration/`, applied in order when the application starts.
Hibernate never creates or changes a table: it runs with `ddl-auto: validate`, so
the application refuses to start when an entity and the migrated schema disagree.

After changing an entity, add the next migration by hand. Flyway does not generate
one:

```sql
-- src/main/resources/db/migration/V2__add_user_bio.sql
ALTER TABLE users ADD COLUMN bio VARCHAR(500) NOT NULL DEFAULT '';
```

Write migrations in SQL that both H2's PostgreSQL mode and Postgres accept, so the
same file runs in development, in tests and in production. `MigrationsTest` fails
when an entity has changes that no migration covers.

## Authentication

JWT access and refresh tokens with the same endpoints and response shapes as the
other backends:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/register/` | Create an account, returns a token pair |
| `POST /api/auth/login/` | Exchange credentials for a token pair |
| `POST /api/auth/refresh/` | Exchange a refresh token for a new pair |
| `GET /api/auth/me/` | Current user profile |
| `PATCH /api/auth/me/` | Update the profile |
| `POST /api/auth/change-password/` | Change password |
| `POST /api/auth/forgot-password/` | Request a reset email (stub) |
| `POST /api/auth/reset-password/` | Complete a reset (stub) |
| `POST /api/auth/logout/` | Log out |

Everything under `/api` needs an access token except the endpoints listed in
`SecurityConfig.PUBLIC`. Take the signed-in user in a controller with
`@AuthenticationPrincipal User user`. Tokens are stateless: a logged-out refresh
token stays valid until it expires. `forgot-password` and `reset-password` return
success without sending mail; wire them to your mail provider.

## Environment

`.env` is generated from `.env.example`, and Spring reads it as a properties file:

```bash
SECRET_KEY=change-me-in-production-use-at-least-32-bytes
CORS_ORIGINS=http://localhost:5173
# DATABASE_URL=jdbc:postgresql://localhost:5432/app?user=app&password=secret
```

`SECRET_KEY` signs the tokens with HMAC-SHA256, so it must be at least 32 bytes;
the application refuses to start with a shorter one. **Set a real `SECRET_KEY`
before deploying.** `CORS_ORIGINS` is comma-separated.

## The Development Loop

`blacksmith dev` runs two backend processes: `./gradlew bootRun` with Spring
DevTools, and a continuous compile (`./gradlew --continuous classes`). Saving a
`.java` file recompiles it, and DevTools restarts the application in under a
second. A change is live a few seconds after you save. That is slower than the
Python and Node backends, which reload in a second or two. The first start, which
compiles everything, takes longer still.

## Moving to Postgres

Set `DATABASE_URL` to a JDBC URL, for example
`jdbc:postgresql://host:5432/db?user=app&password=secret`. The Postgres driver and
Flyway's Postgres support are already dependencies. Flyway creates the tables on
first start.

## Tests

```bash
blacksmith test --backend
```

JUnit drives the whole application through MockMvc against an in-memory database
built by the Flyway migrations. `ApiTest` is the base class: `signUp()` registers a
new user and returns its `Authorization` header. The database lasts the whole run,
so tests create the rows they need and never assume a table is empty.

`blacksmith test --coverage` runs JaCoCo, prints the total line coverage and
writes the HTML report to `build/reports/jacoco/test/html/index.html`.

## Building for Production

[`blacksmith build`](../commands/build.md) runs `./gradlew bootJar` and writes one
executable jar, `build/libs/app.jar`:

```bash
SECRET_KEY=... DATABASE_URL=jdbc:postgresql://... java -jar build/libs/app.jar
```
