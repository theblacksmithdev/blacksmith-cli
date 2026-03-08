---
sidebar_position: 6
---

# blacksmith eject

Remove Blacksmith CLI dependency and convert to a standalone Django + React project.

## Usage

```bash
blacksmith eject
```

## What It Does

The eject command:

1. **Removes `blacksmith.config.json`** from the project root
2. **Converts the project** to a standard Django + React setup

After ejecting:
- All generated code remains intact and functional
- Blacksmith CLI commands will no longer work in this project
- You manage the Django and React projects independently
- OpenAPI sync must be run manually (using `@hey-api/openapi-ts` directly)

## When to Eject

Consider ejecting when:

- Your project has matured beyond the scaffolding phase
- You need customizations that conflict with Blacksmith conventions
- You want to remove the CLI dependency entirely
- You're handing off the project to a team unfamiliar with Blacksmith

## What You Keep

Everything. Ejection doesn't delete any code — it only removes the configuration file that Blacksmith uses to identify the project. Your entire Django + React application continues to work as-is.

## After Ejecting

To continue development without Blacksmith:

```bash
# Backend
cd backend
source venv/bin/activate
python manage.py runserver

# Frontend (in another terminal)
cd frontend
npm run dev

# OpenAPI sync (when needed)
cd frontend
npx @hey-api/openapi-ts
```

:::warning
Ejection is irreversible through the CLI. You would need to manually recreate `blacksmith.config.json` to use Blacksmith commands again.
:::
