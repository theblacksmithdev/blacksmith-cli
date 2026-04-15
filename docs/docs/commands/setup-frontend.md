---
sidebar_position: 12
---

# blacksmith setup:frontend

:::info Requires Frontend
This command is only available for fullstack and frontend-only projects. Backend-only projects will receive an error.
:::

Set up the frontend project environment. Run the parent command for a full setup, or use subcommands to run individual steps.

## Usage

```bash
# Full setup (runs all steps)
blacksmith setup:frontend

# Individual steps
blacksmith setup:frontend node
blacksmith setup:frontend deps
```

## Subcommands

### `setup:frontend node`

Checks if Node.js and npm are installed. If not, attempts to install them automatically:

- **macOS** — uses Homebrew (`brew install node`)
- **Linux** — uses `apt-get` or `dnf`

If Node.js is already present, it reports the installed versions.

### `setup:frontend deps`

Installs Node.js dependencies by running `npm install` in the frontend directory.

Requires Node.js and npm to be installed first.

## Full Setup

Running `blacksmith setup:frontend` without a subcommand executes both steps in order:

1. Install/verify Node.js and npm
2. Install npm dependencies

## Examples

```bash
# Set up everything from scratch
blacksmith setup:frontend

# Just install dependencies after pulling new changes
blacksmith setup:frontend deps

# Fresh install of all dependencies
rm -rf frontend/node_modules
blacksmith setup:frontend deps
```

## When to Use

- After cloning a project for the first time
- After pulling changes that added new npm dependencies
- When setting up a new development machine
- After deleting `node_modules`
