export interface UiSkillOptions {
  /** `--no-ui-skill` */
  uiSkill?: boolean
  /** `--no-chakra-ui-skill`, the flag's name before Vue support; still accepted. */
  chakraUiSkill?: boolean
}

/** Whether to write the UI kit's AI skills. Either flag turns them off. */
export function wantsUiSkill(options: UiSkillOptions): boolean {
  return options.uiSkill !== false && options.chakraUiSkill !== false
}
