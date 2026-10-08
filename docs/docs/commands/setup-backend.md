---
sidebar_position: 11
---

# blacksmith setup:backend

:::note Express backends
On an Express project, `blacksmith setup:backend` installs npm dependencies and applies
Prisma migrations with `prisma migrate deploy`. The `python` and `venv` subcommands are
Python-backend steps (Django and FastAPI) and exit with an error on an Express project;
`deps` works on both.
:::

:::note FastAPI backends
On a FastAPI project, `setup:backend` runs the same Python flow: check Python, create the
virtual environment, and `pip install -r requirements.txt`. The database step in `deps`
then runs `scripts.py init-db` — FastAPI's counterpart to `manage.py migrate` — instead
of Django's migrations.
:::


:::info Requires Backend
This command is only available for fullstack and backend-only projects. Frontend-only projects will receive an error.
:::

Set up the backend project environment. Run the parent command for a full setup, or use subcommands to run individual steps.

## Usage

```bash
# Full setup (runs all steps)
blacksmith setup:backend

# Individual steps
blacksmith setup:backend python
blacksmith setup:backend venv
blacksmith setup:backend deps
```

## Subcommands

### `setup:backend python`

Checks if Python 3 is installed. If not, attempts to install it automatically:

- **macOS** — uses Homebrew (`brew install python3`)
- **Linux** — uses `apt-get` or `dnf`

Also ensures pip is available. If pip is missing, it tries `python3 -m ensurepip` first, then falls back to the system package manager (`python3-pip`).

If Python is already present, it reports the installed version.

### `setup:backend venv`

Creates a Python virtual environment in the backend directory (`venv/`). Skips if one already exists.

Writes a backend `.gitignore` first if one is missing, so `venv/` is ignored
before it exists. An existing `.gitignore` is never overwritten.

Requires Python 3 to be installed first.

### `setup:backend deps`

Installs Python dependencies from `requirements.txt` using pip, then brings the database
up to date: `manage.py migrate` on Django, `scripts.py init-db` on FastAPI.

Requires the virtual environment to exist first. If the venv was created without pip (common on some Linux distributions), it will be installed automatically via `ensurepip`.

## Full Setup

Running `blacksmith setup:backend` without a subcommand executes all three steps in order:

1. Install/verify Python 3 and pip
2. Create virtual environment (with pip)
3. Install dependencies and bring the database up to date

## Examples

```bash
# Set up everything from scratch
blacksmith setup:backend

# Just install dependencies after pulling new changes
blacksmith setup:backend deps

# Recreate the virtual environment
rm -rf backend/venv
blacksmith setup:backend venv
blacksmith setup:backend deps
```

## When to Use

- After cloning a project for the first time
- After pulling changes that added new Python dependencies
- When setting up a new development machine
- After deleting the virtual environment
