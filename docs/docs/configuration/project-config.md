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
    "port": 8000
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
    "port": 8000
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
| `backend.port` | number | — | Port for the Django development server |
| `frontend` | object | No | Present for fullstack and frontend projects |
| `frontend.port` | number | — | Port for the Vite development server |

:::info Backward Compatibility
Projects created before the `type` field was introduced will default to `fullstack` behavior.
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

Located in the backend directory (project root for backend-only, `backend/` for fullstack), this file contains Django-specific environment variables:

```bash
SECRET_KEY=your-secret-key-here
DEBUG=True
DJANGO_SETTINGS_MODULE=config.settings.development
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
