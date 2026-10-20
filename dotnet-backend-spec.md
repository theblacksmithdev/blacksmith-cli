# ASP.NET Core Backend: Parity Contract and Decisions

**Status:** The decisions record for AFBSC-001. This document changes no
behaviour; the CLI's test suite passes exactly as it did before.

## What this document is

The record that settles the seven decisions the fifth backend's specification
leaves open, each with a recommendation. It lands first and in writing on
purpose: every other ticket in this sprint renders templates or writes
conventions against these answers. All seven are taken as recommended. Each
answer carries a one-line reason, and the one answer whose reversal would
change this sprint's size is named where it sits.

## What .NET is here

The fifth backend, after Django, Express, FastAPI and Spring Boot: ASP.NET
Core, selected with `--backend dotnet`. Django and FastAPI cover Python,
Express covers Node, and Spring Boot covers the JVM. .NET reaches the C# and
Microsoft-platform pool, the last large professional backend audience the
other four do not. The Spring specification ranked ASP.NET Core the tier
below its own choice, and this sprint works from that plan.

## The parity contract

Inherited unchanged from the other four backends, because it is the reason one
React frontend and one generated API client serve every backend. .NET
satisfies all of it or it gets its own frontend, which is a different phase
rather than a bigger ticket:

- DRF's error bodies, pagination envelope, and the `/api/auth/...` route names
  and token shape;
- the documentation paths — `/api/schema/`, `/api/docs/` (Swagger UI) and
  `/api/redoc/` (ReDoc);
- OpenAPI 3.0 with DRF-style operation IDs, exported offline so
  `blacksmith sync` regenerates the frontend client with no server listening.

Where ASP.NET Core's defaults break the contract, each is a test in the .NET
backend's own suite, exactly as the Spring phase did it.

## Decisions

### 1. SDK baseline. Taken: .NET 10 (LTS)

Generated projects target `net10.0`. The CLI's prerequisite check reads the
installed SDK version — the way the JVM check reads "Java 17 or newer" — so a
developer whose machine has a different one sees `init` and `setup:backend`
fail fast with a message naming ".NET SDK 10.0 or newer" before any build can
fail cryptically. A newer SDK is fine: it builds an `net10.0` project
unchanged; only an older one is refused.

Reason: .NET 10 is the current LTS — .NET 8 leaves support in November 2026
and .NET 9 is already out of support — so a scaffold targeting anything else
ships an end-of-life baseline.

### 2. Endpoint style. Taken: Minimal APIs

Minimal APIs over MVC controllers. A resource is one route-group file holding
its request, response and handler together, with OpenAPI metadata on the same
code.

Reason: Minimal APIs are ASP.NET Core's current default for HTTP APIs, so the
templates are the smallest they can be and match what a .NET developer
already writes today.

### 3. Data layer. Taken: Entity Framework Core

EF Core over Dapper or raw ADO.NET. The parity contract calls for an
ORM-backed data layer, and EF Core is the framework-default ORM whose
migrations are the schema tool of decision 4.

Reason: EF Core is the ORM the .NET ecosystem teaches by default, so a
newcomer's first resource reads like the documentation they will find
elsewhere.

**This is the answer whose reversal would change the sprint's size.**
Reversed for Dapper or hand-written SQL, the schema tool stops being
first-party (decision 4 falls back to a separate migration library), every
`make:resource` template and both AI skill files are rewritten around SQL
instead of an ORM, and the tests change how they build their database —
every remaining ticket in the sprint grows.

### 4. The schema tool. Taken: EF Core migrations

EF Core migrations over FluentMigrator or DbUp. The migration tool owns the
schema: nothing creates tables at startup, `make:resource` writes the
resource's migration from its template because the columns are known (Flyway's
discipline, Spring's decision 3), a user who adds a field runs
`dotnet ef migrations add`, and the test suite builds its database by
replaying migrations, copying the FastAPI Phase 2 precedent.

Reason: first-party and colocated with the data layer, so resources, tests
and production apply the same migration pipeline.

### 5. API document generator. Taken: Swashbuckle.AspNetCore

Swashbuckle over NSwag or Microsoft.AspNetCore.OpenApi. It serves the parity
documentation paths — Swagger UI at `/api/docs/` and ReDoc at `/api/redoc/` —
and generates the OpenAPI 3.0 document from the code the API runs, pinned to
3.0 the way springdoc's output is. Offline export follows the answer Spring
settled on: a task boots the application context without a web server and
writes the document, so `blacksmith sync` needs no server listening.

Reason: it is the one generator that reads the code, serves both parity UIs
and pins 3.0 without a second tool.

The template tickets inherit the springdoc traps: error responses declared by
exception handlers must stay out of the document, and every endpoint sets its
operation ID (`posts_list`, `posts_retrieve`, ...) so the generated hooks keep
DRF's names.

### 6. Test framework. Taken: xUnit

xUnit over NUnit or MSTest. Each resource ships an API test through
`WebApplicationFactory`, and the suite builds its database by replaying
migrations, as Spring's JUnit tree does.

Reason: xUnit is the ecosystem default — `dotnet new` and Microsoft's own
templates — so the generated suite matches what a .NET developer already
knows.

### 7. Development and test database. Taken: SQLite in development and tests, PostgreSQL in production

This matches the Spring decision (H2 in PostgreSQL mode) in substance: an
embedded file database keeps the .NET SDK the only prerequisite — no Docker —
while production runs on Postgres. Where Spring needed H2 because Hibernate's
SQLite support is a community dialect, EF Core's SQLite provider is
first-party, so SQLite is the direct match. Migrations are written once and
run in development, in tests and in production.

Reason: the same reasoning as Spring's decision 6 — the SDK stays the only
prerequisite, and one migration pipeline serves all three places.

## The dev loop promise

On a .NET project, `blacksmith dev` promises that a saved source file is live
within a few seconds: the watcher recompiles the change and hot-reloads the
running backend through `dotnet watch`, restarting only when a change cannot
be hot-reloaded.

## Out of scope

Any code or template change. This record settles the decisions; the sprint's
other tickets implement them.
