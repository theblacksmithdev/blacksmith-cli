import { SettingsSection } from '../settings-section'
import { SettingRow } from '../setting-row'
import { SettingSelect } from '../setting-select'
import { SettingToggle } from '../setting-toggle'
import { SettingInput } from '../setting-input'
import { useSettings } from '@/hooks/use-settings'

export function AppearanceSettings() {
  const s = useSettings()

  return (
    <SettingsSection
      title="Appearance"
      description="Customize the look and feel of the interface."
    >
      <SettingRow label="Theme" description="Choose between light, dark, or follow your system.">
        <SettingSelect
          value={s.theme}
          options={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          onChange={(v) => s.set('appearance.theme', v)}
        />
      </SettingRow>
      <SettingRow label="Font size" description="Base font size in pixels (12–20).">
        <SettingInput
          value={s.fontSize}
          type="number"
          onChange={(v) => s.set('appearance.fontSize', v)}
        />
      </SettingRow>
      <SettingRow label="Collapse sidebar on launch" description="Start with the sidebar minimized.">
        <SettingToggle
          value={s.sidebarCollapsed}
          onChange={(v) => s.set('appearance.sidebarCollapsed', v)}
        />
      </SettingRow>
    </SettingsSection>
  )
}
