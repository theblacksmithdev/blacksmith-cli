export interface SkillContext {
  projectName: string
}

export interface Skill {
  /** Unique identifier for the skill */
  id: string
  /** Filename in .claude/skills/ (e.g. 'django.md'). If omitted, content is inlined in CLAUDE.md */
  filename?: string
  /** Content rendered by this skill */
  render(ctx: SkillContext): string
}
