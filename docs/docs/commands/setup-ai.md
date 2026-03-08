---
sidebar_position: 7
---

# blacksmith setup:ai

Generate AI development documentation for AI coding assistants.

## Usage

```bash
blacksmith setup:ai
```

## What It Does

Generates comprehensive project-aware documentation that AI coding assistants (like Claude) can use to understand your project:

### CLAUDE.md

A top-level markdown file in the project root containing:

- Project overview and architecture
- Development guidelines and conventions
- Key commands and workflows
- Inline skill documentation

### .claude/skills/

A directory of detailed skill files organized by topic:

| Skill | Description |
|-------|-------------|
| Core Rules | Fundamental project rules and conventions |
| Project Overview | Architecture and directory structure |
| Django Basics | Django model and view patterns |
| Django Advanced | Complex Django patterns (signals, middleware, etc.) |
| DRF (Django REST Framework) | Serializer and viewset patterns |
| API Documentation | OpenAPI and drf-spectacular usage |
| React Basics | Component patterns and conventions |
| React Query | Data fetching and mutation patterns |
| Page Structure | Page layout and routing conventions |
| Blacksmith UI | Component library usage |
| Blacksmith Forms | Form handling with React Hook Form + Zod |
| Blacksmith Auth | Authentication flow and guards |
| Blacksmith Hooks | Custom hooks for common patterns |
| UI Design | Design system and styling guidelines |
| Programming Paradigms | Code style and architectural patterns |
| Clean Code | Code quality guidelines |
| AI Guidelines | How AI assistants should interact with the codebase |

## When to Use

- Run after `blacksmith init` if you didn't use the `--ai` flag
- Run to regenerate AI files after major project changes
- Run when onboarding AI assistants to your project

## Using with AI Assistants

Once generated, AI coding assistants will automatically read `CLAUDE.md` to understand your project context. The skill files provide deep knowledge about specific areas when the AI needs detailed guidance.

```bash
# Generate during project creation
blacksmith init my-app --ai

# Or generate later
cd my-app
blacksmith setup:ai
```
