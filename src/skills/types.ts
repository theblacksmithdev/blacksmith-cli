export interface SkillContext {
  projectName: string
}

export interface Skill {
  /** Unique identifier for the skill — used as the directory name in .claude/skills/[id]/SKILL.md */
  id: string
  /** Display name for the skill frontmatter. If omitted, content is inlined in CLAUDE.md */
  name?: string
  /** Description for the skill frontmatter */
  description?: string
  /** Content rendered by this skill */
  render(ctx: SkillContext): string
}
