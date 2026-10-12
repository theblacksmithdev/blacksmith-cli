---
sidebar_position: 3
---

# Prerequisites

Blacksmith CLI requires a few tools to be installed on your system. The exact requirements depend on your project type.

## Required for All Projects

### Node.js (>= 20.5.0)

Node.js is required to run the Blacksmith CLI itself and for frontend projects.

```bash
# Check your version
node --version

# Should output v20.5.0 or higher
```

### Python 3 (Backend and Fullstack Projects)

Python is required for projects that include a Django or FastAPI backend (Express backends use Node.js instead, Spring Boot backends use Java). Blacksmith creates a virtual environment for each project. Not needed for frontend-only projects.

```bash
# Check your version
python3 --version

# Should output Python 3.8 or higher
```

### Java 17+ (Spring Boot Backends Only)

A JDK is required for projects with a Spring Boot backend (`--backend spring`). The project compiles with `--release 17`, so any JDK 17 or newer works. `blacksmith init` reads `java -version` and stops with "Java 17 or newer is required but not found. Install a JDK from https://adoptium.net" if it is missing. Python is not needed for these projects, and you don't need to install Gradle: the project ships the Gradle wrapper (`./gradlew`), which downloads Gradle on first use.

```bash
# Check your version
java -version

# Should report version 17 or higher
```

### npm

npm is bundled with Node.js and is used to install frontend dependencies.

```bash
# Check your version
npm --version
```

### pip

pip is bundled with Python and is used to install backend dependencies (Django and FastAPI only).

```bash
# Check your version
pip3 --version
```

## What Blacksmith Sets Up For You

When you run `blacksmith init`, the CLI automatically:

- Creates a **Python virtual environment** (`backend/venv/`)
- Installs the backend dependencies — **Django**, **Django REST Framework**, **drf-spectacular**, and **SimpleJWT** (or the **Express**/**FastAPI** equivalents when selected; a Spring Boot backend is compiled with `./gradlew classes` instead, which downloads Gradle and the dependencies)
- Installs **React**, **Vite**, **TanStack Query**, **React Router**, **Chakra UI**, and other frontend dependencies
- Configures **environment files** (`.env`) for both stacks
- Runs **initial database migrations** (SQLite by default; Spring Boot applies its Flyway migrations when the app starts)
- Performs the **first OpenAPI sync** to generate TypeScript types

You don't need to install Django, React, or any project dependencies manually — Blacksmith handles all of that.
