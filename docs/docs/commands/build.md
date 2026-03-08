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

The build command performs two steps:

### 1. Build React Frontend

Runs `npm run build` in the frontend directory using Vite, which:

- Bundles and minifies JavaScript/TypeScript
- Optimizes CSS (Tailwind CSS purging)
- Generates static assets in `frontend/dist/`

### 2. Collect Django Static Files

Runs `python manage.py collectstatic` to gather all static files (including the built frontend) into Django's static files directory for serving in production.

## Output

After building, you'll have:

- `frontend/dist/` — Optimized frontend bundle
- `backend/staticfiles/` — Collected static files for Django

## Deployment

The built project can be deployed to any platform that supports Django:

- **Traditional hosting** — Serve with Gunicorn/uWSGI behind Nginx
- **Platform-as-a-Service** — Deploy to Heroku, Railway, Render, etc.
- **Containers** — Package in Docker containers
- **Cloud** — Deploy to AWS, GCP, Azure, etc.

For detailed deployment instructions, see the [Deployment Guide](/docs/guides/deployment).
