---
sidebar_position: 5
---

# AI-Assisted Development

Blacksmith generates comprehensive documentation that enables AI coding assistants to understand and work effectively with your project.

## Setting Up

Generate AI documentation during project creation or at any time:

```bash
# During init
blacksmith init my-app --ai

# After init
blacksmith setup:ai
```

## What Gets Generated

### CLAUDE.md

A top-level file that serves as the AI assistant's entry point. It contains:

- Project architecture overview
- Key development commands
- Coding conventions and patterns
- Inline skill documentation for core concepts

### .claude/skills/

Detailed skill files organized by topic. Each skill is a focused document covering a specific area of development:

- **Django patterns** — Models, views, serializers, URL configuration
- **React patterns** — Components, hooks, state management
- **API patterns** — OpenAPI, React Query, data fetching
- **UI patterns** — Component library, forms, authentication
- **Code quality** — Clean code guidelines, programming paradigms

## How AI Assistants Use This

When an AI coding assistant (like Claude) opens your project, it reads `CLAUDE.md` to understand:

1. **What the project is** — Stack, architecture, directory layout
2. **How to develop** — Commands, workflows, conventions
3. **What patterns to follow** — Code style, component patterns, Django conventions
4. **What to avoid** — Anti-patterns, common mistakes

The skill files provide deeper context when the AI is working on specific areas (e.g., creating a new Django model or building a React form).

## Workflow with AI

```bash
# 1. Set up AI documentation
blacksmith setup:ai

# 2. Create a resource scaffold
blacksmith make:resource Invoice

# 3. Ask the AI to implement your business logic
# The AI now knows:
# - Your project structure
# - Django model patterns to follow
# - React component patterns to follow
# - How the OpenAPI sync works
# - Available UI components and hooks
```

## Viewing Available Skills

List all skills and their status:

```bash
blacksmith skills
```

## Regenerating

If you've made significant changes to your project, regenerate the AI files:

```bash
blacksmith setup:ai
```

This updates the documentation to reflect the current state of your project.
