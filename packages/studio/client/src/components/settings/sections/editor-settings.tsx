import { SettingsSection } from '../settings-section'
import { SettingRow } from '../setting-row'
import { SettingSelect } from '../setting-select'
import { SettingToggle } from '../setting-toggle'
import { useSettings } from '@/hooks/use-settings'

export function EditorSettings() {
  const s = useSettings()

  return (
    <SettingsSection
      title="Editor"
      description="Configure the built-in code viewer and editor."
    >
      <SettingRow label="Tab size" description="Number of spaces per indentation level.">
        <SettingSelect
          value={String(s.tabSize)}
          options={[
            { value: '2', label: '2 spaces' },
            { value: '4', label: '4 spaces' },
          ]}
          onChange={(v) => s.set('editor.tabSize', Number(v))}
        />
      </SettingRow>
      <SettingRow label="Word wrap" description="Wrap long lines instead of horizontal scrolling.">
        <SettingToggle
          value={s.wordWrap}
          onChange={(v) => s.set('editor.wordWrap', v)}
        />
      </SettingRow>
      <SettingRow label="Minimap" description="Show a minimap overview for large files.">
        <SettingToggle
          value={s.minimap}
          onChange={(v) => s.set('editor.minimap', v)}
        />
      </SettingRow>
      <SettingRow label="Line numbers" description="Display line numbers in the gutter.">
        <SettingToggle
          value={s.lineNumbers}
          onChange={(v) => s.set('editor.lineNumbers', v)}
        />
      </SettingRow>
    </SettingsSection>
  )
}
