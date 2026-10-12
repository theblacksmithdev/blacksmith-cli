---
sidebar_position: 14
---

# blacksmith test

:::note Express backends
Backend tests run with Vitest and Supertest instead of pytest. `--coverage` and `--watch`
work the same. The suite rebuilds a SQLite database from `schema.prisma` on each run.
:::

:::note FastAPI backends
Backend tests run with pytest through the project venv, exactly like Django. The
generated suite points `DATABASE_URL` at a throwaway SQLite file and builds it by running
the Alembic migrations, so no database setup is needed before the first run.
`--coverage` works the same.
:::

:::note Spring Boot backends
Backend tests run with `./gradlew test` (JUnit 5). The suite builds an in-memory H2
database from the Flyway migrations, and Hibernate's `ddl-auto: validate` makes the app
fail to start — and `MigrationsTest` fail — when an entity changes without a migration.
`--watch` runs `./gradlew test --continuous`. `--coverage` runs `./gradlew test
jacocoTestReport`, prints the total line coverage, and writes the HTML report to
`build/reports/jacoco/test/html/index.html`.
:::


Run the project's test suites — pytest on the backend, Vitest on the frontend.

## Usage

```bash
# Run every suite the project has
blacksmith test

# One side only
blacksmith test --backend
blacksmith test --frontend

# With coverage
blacksmith test --coverage

# Watch mode (one suite at a time)
blacksmith test --frontend --watch
```

## What It Does

Based on your project type in `blacksmith.config.json`:

- **Fullstack** — runs pytest in `backend/`, then Vitest in `frontend/`
- **Backend only** — runs pytest
- **Frontend only** — runs Vitest

Both suites run even if the first one fails, so a single command shows you
everything that is broken. The command exits non-zero if either suite fails,
naming which one.

## Options

| Option | Description |
|--------|-------------|
| `--backend` | Run only the backend suite |
| `--frontend` | Run only the frontend suite |
| `--coverage` | Report coverage (`pytest --cov`, `vitest --coverage`) |
| `--watch` | Re-run on change. Runs one suite, so pair it with `--backend` or `--frontend` |

## Requirements

The backend suite needs the virtual environment (`blacksmith setup:backend`) and
the frontend suite needs `node_modules` (`blacksmith setup:frontend`). If either
is missing, the command says which setup step to run.

## Examples

```bash
# Everything, before pushing
blacksmith test

# Iterate on one component
blacksmith test --frontend --watch

# Check backend coverage
blacksmith test --backend --coverage
```

## Related Commands

- [`setup`](./setup.md) — install dependencies for both sides
- [`make:resource`](./make-resource.md) — scaffolds tests alongside each new resource
