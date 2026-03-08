---
sidebar_position: 3
---

# Prerequisites

Blacksmith CLI requires a few tools to be installed on your system before you can create and develop projects.

## Required

### Node.js (>= 20.5.0)

Node.js is required to run the Blacksmith CLI itself and to build the React frontend.

```bash
# Check your version
node --version

# Should output v20.5.0 or higher
```

### Python 3

Python is required for the Django backend. Blacksmith creates a virtual environment for each project.

```bash
# Check your version
python3 --version

# Should output Python 3.8 or higher
```

### npm

npm is bundled with Node.js and is used to install frontend dependencies.

```bash
# Check your version
npm --version
```

### pip

pip is bundled with Python and is used to install backend dependencies.

```bash
# Check your version
pip3 --version
```

## What Blacksmith Sets Up For You

When you run `blacksmith init`, the CLI automatically:

- Creates a **Python virtual environment** (`backend/venv/`)
- Installs **Django**, **Django REST Framework**, **drf-spectacular**, **SimpleJWT**, and other backend dependencies
- Installs **React**, **Vite**, **TanStack Query**, **React Router**, **Tailwind CSS**, and other frontend dependencies
- Configures **environment files** (`.env`) for both stacks
- Runs **initial database migrations** (SQLite by default)
- Performs the **first OpenAPI sync** to generate TypeScript types

You don't need to install Django, React, or any project dependencies manually — Blacksmith handles all of that.
