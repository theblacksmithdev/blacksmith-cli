import { SettingsSection } from '../settings-section'
import { SettingRow } from '../setting-row'
import { SettingSelect } from '../setting-select'
import { SettingInput } from '../setting-input'
import { SettingTextarea } from '../setting-textarea'
import { useSettings } from '@/hooks/use-settings'

export function AiSettings() {
  const s = useSettings()

  return (
    <SettingsSection
      title="AI & Prompting"
      description="Control how Claude processes your requests and generates code."
    >
      <SettingRow label="Model" description="The Claude model used for code generation.">
        <SettingSelect
          value={s.model}
          options={[
            { value: 'sonnet', label: 'Sonnet — fast' },
            { value: 'opus', label: 'Opus — powerful' },
            { value: 'haiku', label: 'Haiku — lightweight' },
          ]}
          onChange={(v) => s.set('ai.model', v)}
        />
      </SettingRow>
      <SettingRow label="Permission mode" description="How Claude handles file edits and shell commands.">
        <SettingSelect
          value={s.permissionMode}
          options={[
            { value: 'bypassPermissions', label: 'Auto-approve all' },
            { value: 'auto', label: 'Smart auto-approve' },
            { value: 'default', label: 'Ask for each action' },
          ]}
          onChange={(v) => s.set('ai.permissionMode', v)}
        />
      </SettingRow>
      <SettingRow label="Budget limit" description="Max USD per prompt. Leave empty for unlimited.">
        <SettingInput
          value={s.maxBudget ?? ''}
          type="number"
          placeholder="No limit"
          onChange={(v) => s.set('ai.maxBudget', v === '' || v === 0 ? null : v)}
        />
      </SettingRow>
      <SettingRow
        label="Custom instructions"
        description="Extra rules appended to every prompt. Use this for project-specific conventions like coding style, libraries to prefer, or patterns to follow."
        fullWidth
      >
        <SettingTextarea
          value={s.customInstructions}
          placeholder="e.g. Always use Tailwind for styling. Prefer functional components. Use snake_case for Python variables."
          onChange={(v) => s.set('ai.customInstructions', v)}
        />
      </SettingRow>
    </SettingsSection>
  )
}
