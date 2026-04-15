---
sidebar_position: 13
---

# blacksmith setup

Set up the entire project in one command. Detects your project type and runs the appropriate setup steps.

## Usage

```bash
blacksmith setup
```

## What It Does

Based on your project type in `blacksmith.config.json`:

- **Fullstack** — runs `setup:backend` then `setup:frontend`
- **Backend only** — runs `setup:backend`
- **Frontend only** — runs `setup:frontend`

Each setup runs the full sequence for that side of the project (install runtime, create environment, install dependencies).

## Examples

```bash
# Clone and set up a fullstack project
git clone <repo-url> my-app
cd my-app
blacksmith setup
blacksmith dev
```

## Related Commands

- [`setup:backend`](./setup-backend.md) — set up only the backend
- [`setup:frontend`](./setup-frontend.md) — set up only the frontend
