---
sidebar_position: 5
---

# blacksmith build

Build the project for production deployment.

## Usage

```bash
blacksmith build
```

## What It Does

The build steps depend on your project type:

### Fullstack Projects

1. **Build React frontend** — Runs `npm run build` via Vite (bundle, minify, optimize)
2. **Collect Django static files** — Runs `manage.py collectstatic` to gather all static files

### Backend-Only Projects

1. **Collect Django static files** — Runs `manage.py collectstatic`

### Frontend-Only Projects

1. **Build React frontend** — Runs `npm run build` via Vite

## Output

| Project Type | Output |
|---|---|
| Fullstack | `frontend/dist/` (frontend bundle) + `backend/staticfiles/` (Django static files) |
| Backend | `staticfiles/` at project root |
| Frontend | `dist/` at project root |

## Deployment

The built project can be deployed to any platform:

- **Traditional hosting** — Serve with Gunicorn/uWSGI behind Nginx
- **Platform-as-a-Service** — Deploy to Heroku, Railway, Render, etc.
- **Containers** — Package in Docker containers
- **Cloud** — Deploy to AWS, GCP, Azure, etc.

For detailed deployment instructions, see the [Deployment Guide](/docs/guides/deployment).
