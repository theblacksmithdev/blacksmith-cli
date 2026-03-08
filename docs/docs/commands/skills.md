---
sidebar_position: 10
---

# blacksmith skills

List all available AI development skills and their generation status.

## Usage

```bash
blacksmith skills
```

## What It Does

Displays a table of all available AI development skills showing:

- **Skill name** — The topic or area covered
- **Description** — What the skill provides
- **Status** — Whether the skill file has been generated

## Output Example

```
Available AI Development Skills:

  Name                    Description                              Status
  ─────────────────────── ──────────────────────────────────────── ──────────
  Core Rules              Fundamental project rules                Generated
  Project Overview        Architecture and directory structure     Generated
  Django Basics           Model and view patterns                  Generated
  DRF                     Serializer and viewset patterns          Not Generated
  React Query             Data fetching patterns                   Not Generated
  ...
```

## Generating Skills

To generate all skill files, use:

```bash
blacksmith setup:ai
```

See the [setup:ai command](/docs/commands/setup-ai) for details on what each skill covers.
