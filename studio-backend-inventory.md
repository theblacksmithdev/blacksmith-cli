# Studio Backend Inventory: Studio Assumes Django

**Status:** A record of the measurement Phase 3 called for. It changes no
behaviour. The FastAPI plan's Phase 3 said to establish "whether [Studio not
passing `--backend`] is a small omission or a body of work", and to pull it out
as its own stream if it is the latter. It is the latter, and this record is
why.

Line numbers are as of commit `daad4e6`.

---

## The finding

Studio does not just omit `--backend` when it creates a project. Every part of
Studio that touches the backend assumes Django. Adding the flag on its own
would make things worse. Studio could then create an Express or FastAPI
project, but it could not run that project, and it would tell Claude to write
Django code in it.

## Every site

| Site | Today | What it must do |
|------|-------|-----------------|
| `server/routes/api.ts:164-171` (create) | Runs `blacksmith init` with `-b`, `-f`, `-t` and never `--backend`, so every project is Django. | Pass the chosen framework. |
| `client/src/pages/projects/add/create-new.tsx` (form) | No framework field. Its copy says "Scaffold a fullstack Django + React project." | Add a framework choice and copy that names all three. |
| `client/src/pages/projects/add/choose-type.tsx:31` | "Scaffold a new Blacksmith project with Django backend…" | Name the three backends. |
| `server/services/runner/spawn-backend.ts` | Always starts `venv/bin/python manage.py runserver`, and errors when the venv is missing. Express projects have no venv. FastAPI projects have one, but no `manage.py`. | Start each framework's dev server, as the CLI's `dev.ts` already does (`npm run dev`, `uvicorn app.main:app`, `runserver`). |
| `server/services/runner/config.ts` | Reads ports only, not `backend.framework`. | Read the framework too, so the runner and prompts can branch on it. |
| `server/services/runner/index.ts:63` and the runner's emit strings | "Stopping Django…", "Starting Django…", "Django stopped". | Use the framework's name. |
| `client/src/components/runner/runner-logs.tsx:46,131` | Labels backend logs `django` and its filter button `Django`. | Use the framework's name, which the client needs from the project API. |
| `server/services/claude/system-prompt.ts:41-82` | A fixed "Backend Architecture (Django — Strict OOP)" section in every Claude session's system prompt. | Choose the backend section per project, or defer to the project's own CLAUDE.md skills, which are framework-aware as of Phase 3. |
| `server/services/claude/args.ts:27-37` | Appends that one fixed prompt to every session. | Build the prompt from the project's framework. |
| `server/services/templates.ts:28,33` | Prompt templates ask for "Django model, serializer, viewset" and describe "a new Django REST API endpoint". | Template text per framework. |
| `client/src/components/chat/home-view/quick-actions.tsx:20,31-32` | Quick actions offer Django resources and Django REST endpoints. | Text per framework. |

Server and client both change. The client also needs to learn the project's
framework, which no Studio API returns today.

## Recommendation

Make this its own stream, with one ticket per concern:

1. **Run any backend.** Fix the runner, the config reader and the log labels. Until this
   lands, Studio cannot run the projects it would create.
2. **Create any backend.** Add the create form's framework field and pass `--backend`.
   This depends on ticket 1.
3. **Prompt for any backend.** Cover the system prompt, the prompt templates and the
   quick actions. The CLI's skills are already framework-aware, so the system prompt's
   Django section can probably shrink to "follow CLAUDE.md" rather than being written
   three times.

Until then, Studio stays a Django-only tool, and it says so in its own copy.
