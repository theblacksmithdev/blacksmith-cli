---
sidebar_position: 9
---

# blacksmith frontend

Run npm commands in the frontend directory.

## Usage

```bash
blacksmith frontend <command> [args...]
```

## What It Does

Runs `npm <command>` in the `frontend/` directory, so you don't need to change directories.

## Common Commands

```bash
# Install a new package
blacksmith frontend install axios

# Install a dev dependency
blacksmith frontend install -D @types/lodash

# Remove a package
blacksmith frontend uninstall axios

# Run tests
blacksmith frontend test

# Run linting
blacksmith frontend run lint

# Update packages
blacksmith frontend update
```

## Examples

```bash
# Add a UI library
blacksmith frontend install @headlessui/react

# Add form utilities
blacksmith frontend install react-hook-form zod @hookform/resolvers

# Check for outdated packages
blacksmith frontend outdated
```

## Why Use This?

Instead of changing directories:

```bash
# Without Blacksmith
cd frontend
npm install axios
cd ..

# With Blacksmith
blacksmith frontend install axios
```

The `frontend` command automatically runs npm in the correct directory regardless of where you are in the project.
