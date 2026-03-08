---
sidebar_position: 6
---

# Deployment

This guide covers preparing your Blacksmith project for production deployment.

## Build for Production

```bash
blacksmith build
```

This command:
1. Builds the React frontend with Vite (output in `frontend/dist/`)
2. Collects Django static files (including the built frontend)

## Production Checklist

Before deploying, ensure you've addressed these items:

### Backend Configuration

Update `backend/config/settings/production.py`:

```python
# Set your production domain
ALLOWED_HOSTS = ['your-domain.com']

# Use a production database (PostgreSQL recommended)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT', default='5432'),
    }
}

# Configure CORS for your frontend domain
CORS_ALLOWED_ORIGINS = [
    'https://your-domain.com',
]
```

### Environment Variables

Set these in your production environment:

```bash
DJANGO_SETTINGS_MODULE=config.settings.production
SECRET_KEY=<generate-a-strong-secret-key>
DEBUG=False
DATABASE_URL=postgres://user:pass@host:5432/dbname
ALLOWED_HOSTS=your-domain.com
```

### Static Files

Configure a static file storage backend (e.g., AWS S3, WhiteNoise):

```bash
# Install WhiteNoise for serving static files
pip install whitenoise
```

## Deployment Options

### Docker

Create a `Dockerfile` for the Django backend:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY frontend/dist/ /app/static/frontend/

ENV DJANGO_SETTINGS_MODULE=config.settings.production

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Platform as a Service

**Heroku / Railway / Render:**

1. Build the frontend: `cd frontend && npm run build`
2. Configure the platform to use `backend/` as the root
3. Set the start command: `gunicorn config.wsgi:application`
4. Configure environment variables in the platform dashboard

### Traditional Server

Using **Nginx + Gunicorn**:

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

Configure Nginx to proxy to Gunicorn and serve static files directly.

## Ejecting Before Deployment

If you prefer not to have Blacksmith as a dependency in production:

```bash
blacksmith eject
```

This converts your project to a standard Django + React project. See the [eject command](/docs/commands/eject) for details.
