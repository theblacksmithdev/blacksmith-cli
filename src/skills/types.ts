export interface SkillContext {
  projectName: string
}

export interface Skill {
  /** Unique identifier for the skill */
  id: string
  /** Section returned by this skill for CLAUDE.md */
  render(ctx: SkillContext): string
}
