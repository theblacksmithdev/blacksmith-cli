---
sidebar_position: 2
---

# blacksmith dev

Start the development server with hot reloading and automatic type synchronization.

## Usage

```bash
blacksmith dev
```

Run this command from your project root (the directory containing `blacksmith.config.json`).

## What It Does

The `dev` command starts three processes concurrently:

### 1. Django Development Server

Starts the Django backend using the project's virtual environment:

```
http://localhost:8000
```

API endpoints are available at `/api/` and Swagger documentation at `/api/docs/`.

### 2. Vite Development Server

Starts the React frontend with Hot Module Replacement (HMR):

```
http://localhost:5173
```

Changes to React components are reflected instantly in the browser.

### 3. OpenAPI File Watcher

Watches for changes in backend Python files (`.py`) using `chokidar`. When a change is detected, it automatically:

1. Generates a fresh OpenAPI schema from Django
2. Regenerates TypeScript types, Zod schemas, API client, and React Query hooks

This means editing a Django serializer immediately updates your frontend types.

## Port Detection

Blacksmith automatically detects if the configured ports are in use and finds available alternatives. The actual ports being used are displayed in the terminal output.

## Stopping the Server

Press `Ctrl+C` to gracefully stop all three processes.

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

Ensure you've run `blacksmith init` first, which creates the virtual environment at `backend/venv/`.

### Sync Errors

If the OpenAPI sync fails during development, you can manually trigger it:

```bash
blacksmith sync
```
