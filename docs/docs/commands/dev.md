---
sidebar_position: 2
---

# blacksmith dev

:::note Express backends
The backend process is `npm run dev` (tsx watch) instead of the Django development server,
and the OpenAPI watcher follows `.ts` files rather than `.py`. Everything else is the same.
:::

:::note FastAPI backends
The backend process is `./venv/bin/uvicorn app.main:app --reload` instead of the Django
development server. Swagger UI stays at `/api/docs/` and the OpenAPI watcher follows `.py`
files, so everything else is the same.
:::

:::note Spring Boot backends
The backend runs as two processes: `./gradlew bootRun` (with Spring DevTools) and
`./gradlew --continuous classes`, a continuous compile. Saving a `.java` file recompiles it
and DevTools restarts the app, so a change is live a few seconds after you save — slower
than the Python and Node backends, which reload in a second or two. The first start is
slower still while Gradle warms up. The OpenAPI watcher follows `.java` files and waits
about 8 seconds after the last change before syncing.
:::


Start the development server with hot reloading and automatic type synchronization.

## Usage

```bash
blacksmith dev
```

Run this command from your project root (the directory containing `blacksmith.config.json`).

## What It Does

The processes started depend on your project type:

### Fullstack Projects

Starts three processes concurrently:

1. **Django Development Server** — API backend at `http://localhost:<backend-port>`
2. **Vite Development Server** — React frontend with HMR at `http://localhost:<frontend-port>`
3. **OpenAPI File Watcher** — Watches `.py` files and auto-syncs TypeScript types on changes

### Backend-Only Projects

Starts one process:

1. **Django Development Server** — API backend at `http://localhost:<backend-port>`

### Frontend-Only Projects

Starts one process:

1. **Vite Development Server** — React frontend with HMR at `http://localhost:<frontend-port>`

## Port Detection

Blacksmith automatically detects if the configured ports are in use and finds available alternatives. The actual ports being used are displayed in the terminal output.

## Stopping the Server

Press `Ctrl+C` to gracefully stop all processes.

## Troubleshooting

### Port Already in Use

If you see port conflict errors, either stop the process using the port or configure different ports in `blacksmith.config.json`:

```json
{
  "backend": { "port": 9000 },
  "frontend": { "port": 3001 }
}
```

### Python Virtual Environment Not Found

Ensure you've run `blacksmith init` first, which creates the virtual environment at `venv/` in the backend directory. (Spring Boot backends have no virtual environment; they need Java 17 or newer.)

### Sync Errors (Fullstack Only)

If the OpenAPI sync fails during development, you can manually trigger it:

```bash
blacksmith sync
```
