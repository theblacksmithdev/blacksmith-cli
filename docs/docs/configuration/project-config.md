---
sidebar_position: 1
---

# Project Configuration

## blacksmith.config.json

Every Blacksmith project has a `blacksmith.config.json` file in the project root. This file tells the CLI that the directory is a Blacksmith project and stores project metadata.

### Schema

**Fullstack project:**
```json
{
  "name": "my-app",
  "version": "0.1.0",
  "type": "fullstack",
  "backend": {
    "port": 8000,
    "framework": "django"
  },
  "frontend": {
    "port": 5173
  }
}
```

**Backend-only project:**
```json
{
  "name": "my-api",
  "version": "0.1.0",
  "type": "backend",
  "backend": {
    "port": 8000,
    "framework": "express"
  }
}
```

**Frontend-only project:**
```json
{
  "name": "my-ui",
  "version": "0.1.0",
  "type": "frontend",
  "frontend": {
    "port": 5173
  }
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Project name |
| `version` | string | Yes | Project version |
| `type` | string | Yes | Project type: `fullstack`, `backend`, or `frontend` |
| `backend` | object | No | Present for fullstack and backend projects |
| `backend.port` | number | — | Port for the backend development server |
| `backend.framework` | string | No | `django` or `express`. Absent means `django` |
| `frontend` | object | No | Present for fullstack and frontend projects |
| `frontend.port` | number | — | Port for the Vite development server |

:::info Backward Compatibility
Projects created before the `type` field was introduced default to `fullstack` behavior.
Projects created before Express support have no `backend.framework` field; its absence reads
as `django`, so they keep working untouched.
:::

:::warning
`backend.framework` records which backend was generated — it does not switch one. Changing it
on an existing project points the CLI at a toolchain the code does not use. See
[Choosing a Backend](../guides/choosing-a-backend.md).
:::

### Changing Ports

To change the development server ports, edit `blacksmith.config.json`:

```json
{
  "backend": { "port": 9000 },
  "frontend": { "port": 3000 }
}
```

Then restart `blacksmith dev` for the changes to take effect.

## Environment Files

### Backend (.env)

Located in the backend directory (project root for backend-only, `backend/` for fullstack).

**Django:**
```bash
SECRET_KEY=your-secret-key-here
DEBUG=True
DJANGO_SETTINGS_MODULE=config.settings.development
```

**Express:**
```bash
NODE_ENV=development
PORT=8000
DATABASE_URL="file:./dev.db"
JWT_SECRET=change-me-in-production
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

A `.env.example` template is also generated for reference.

### Frontend (.env)

Located in the frontend directory (project root for frontend-only, `frontend/` for fullstack), this file contains Vite environment variables:

```bash
VITE_API_URL=http://localhost:8000
```

The `VITE_API_URL` variable configures the API base URL for the generated client.

## Project Detection

Blacksmith detects the project root by searching for `blacksmith.config.json` in the current directory and parent directories. This means you can run Blacksmith commands from any subdirectory within your project.

If no config file is found, Blacksmith will display an error asking you to run the command from within a Blacksmith project.
