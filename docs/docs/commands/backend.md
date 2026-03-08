---
sidebar_position: 8
---

# blacksmith backend

Run Django management commands through the project's virtual environment.

## Usage

```bash
blacksmith backend <command> [args...]
```

## What It Does

Wraps `python manage.py <command>` using the project's Python virtual environment, so you don't need to manually activate the virtualenv.

## Common Commands

```bash
# Create a superuser for the Django admin
blacksmith backend createsuperuser

# Create new migrations after model changes
blacksmith backend makemigrations

# Apply pending migrations
blacksmith backend migrate

# Open the Django shell
blacksmith backend shell

# Show all registered URLs
blacksmith backend show_urls

# Check for project issues
blacksmith backend check

# Flush the database
blacksmith backend flush
```

## Examples

```bash
# Create migrations for a specific app
blacksmith backend makemigrations products

# Run a specific migration
blacksmith backend migrate products 0003

# Export data as fixtures
blacksmith backend dumpdata products --indent 2

# Load fixtures
blacksmith backend loaddata products/fixtures/initial.json
```

## Why Use This?

Instead of manually activating the virtual environment:

```bash
# Without Blacksmith
cd backend
source venv/bin/activate
python manage.py createsuperuser

# With Blacksmith
blacksmith backend createsuperuser
```

The `backend` command automatically uses the correct Python interpreter from the project's virtual environment.
