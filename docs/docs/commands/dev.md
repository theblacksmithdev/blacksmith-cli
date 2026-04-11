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

Ensure you've run `blacksmith init` first, which creates the virtual environment at `venv/` in the backend directory.

### Sync Errors (Fullstack Only)

If the OpenAPI sync fails during development, you can manually trigger it:

```bash
blacksmith sync
```
