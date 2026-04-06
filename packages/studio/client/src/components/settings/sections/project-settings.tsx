import { SettingsSection } from '../settings-section'
import { SettingRow } from '../setting-row'
import { SettingInput } from '../setting-input'
import { SettingTextarea } from '../setting-textarea'
import { useSettings } from '@/hooks/use-settings'

export function ProjectSettings() {
  const s = useSettings()

  return (
    <SettingsSection
      title="Project"
      description="Project-level preferences and file browser configuration."
    >
      <SettingRow label="Display name" description="Shown in the sidebar header. Defaults to the folder name.">
        <SettingInput
          value={s.displayName}
          placeholder="My Project"
          onChange={(v) => s.set('project.displayName', v)}
        />
      </SettingRow>
      <SettingRow
        label="Ignored patterns"
        description="Comma-separated list of file and folder names to hide from the code browser."
        fullWidth
      >
        <SettingTextarea
          value={s.ignoredPatterns}
          placeholder="node_modules, .git, __pycache__, venv, dist, .env"
          onChange={(v) => s.set('project.ignoredPatterns', v)}
        />
      </SettingRow>
    </SettingsSection>
  )
}
