---
sidebar_position: 1
---

# Backend Stack

Blacksmith's backend is built on Django and Django REST Framework, with several carefully chosen packages for a production-ready setup.

## Core Technologies

### Django

The web framework that powers the backend. Blacksmith uses Django's:

- **ORM** for database models and queries
- **Migrations** for database schema management
- **Admin** for data management interface
- **Settings** module with split configuration (base/development/production)

### Django REST Framework (DRF)

Provides the REST API layer:

- **Serializers** for data validation and transformation
- **ViewSets** for CRUD endpoints with minimal code
- **Routers** for automatic URL pattern generation
- **Permissions** for access control
- **Pagination** for list endpoints

### drf-spectacular

Generates OpenAPI 3.0 schemas from your DRF serializers and viewsets. This is the engine behind Blacksmith's type synchronization — it introspects your Python code and produces a machine-readable API specification.

Features used:
- Automatic schema generation from serializers
- Swagger UI at `/api/docs/`
- Schema validation

### SimpleJWT

Token-based authentication using JSON Web Tokens:

- Access tokens for API authentication
- Refresh tokens for obtaining new access tokens
- Configurable token lifetimes

### django-environ

Environment variable management:

- Reads `.env` files
- Type-casting (bool, int, list, etc.)
- Default values

## Project Layout

```
backend/
├── config/
│   ├── settings/
│   │   ├── base.py           # Shared: apps, middleware, REST config
│   │   ├── development.py    # Debug, CORS, SQLite
│   │   └── production.py     # Security, PostgreSQL
│   ├── urls.py               # Root URL config with API router
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   └── users/                # Pre-built auth app
├── manage.py
├── requirements.txt
└── venv/
```

## Dependencies

The generated `requirements.txt` includes:

| Package | Purpose |
|---------|---------|
| `django` | Web framework |
| `djangorestframework` | REST API toolkit |
| `drf-spectacular` | OpenAPI schema generation |
| `djangorestframework-simplejwt` | JWT authentication |
| `django-environ` | Environment variables |
| `django-cors-headers` | CORS handling for frontend |

## Database

- **Development** — SQLite (zero configuration)
- **Production** — PostgreSQL recommended (configure in `production.py`)

## Running Django Commands

Use the `blacksmith backend` wrapper to run any Django management command:

```bash
blacksmith backend shell          # Django shell
blacksmith backend dbshell        # Database shell
blacksmith backend showmigrations # Show migration status
blacksmith backend test           # Run tests
```

Or activate the virtual environment manually:

```bash
cd backend
source venv/bin/activate
python manage.py <command>
```
