import { useEffect } from 'react'
import { Box, Text } from '@chakra-ui/react'
import { PageContainer } from '@/components/shared/page-container'
import { SettingsSection } from '@/components/settings/settings-section'
import { SettingRow } from '@/components/settings/setting-row'
import { SettingSelect } from '@/components/settings/setting-select'
import { SettingToggle } from '@/components/settings/setting-toggle'
import { SettingInput } from '@/components/settings/setting-input'
import { SettingTextarea } from '@/components/settings/setting-textarea'
import { useSettings } from '@/hooks/use-settings'
import { useSettingsStore } from '@/stores/settings-store'

export default function SettingsPage() {
  const { fetchSettings } = useSettingsStore()
  const s = useSettings()

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return (
    <Box css={{ height: '100%', overflowY: 'auto' }}>
      <PageContainer>
        <Text
          css={{
            fontSize: '24px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--studio-text-primary)',
            marginBottom: '32px',
          }}
        >
          Settings
        </Text>

        {/* Appearance */}
        <SettingsSection title="Appearance" description="Customize the look and feel of Blacksmith Studio.">
          <SettingRow label="Theme" description="Choose between light, dark, or system preference.">
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
          <SettingRow label="Font size" description="Base font size for the interface (12–20px).">
            <SettingInput
              value={s.fontSize}
              type="number"
              onChange={(v) => s.set('appearance.fontSize', v)}
            />
          </SettingRow>
          <SettingRow label="Collapse sidebar by default">
            <SettingToggle
              value={s.sidebarCollapsed}
              onChange={(v) => s.set('appearance.sidebarCollapsed', v)}
            />
          </SettingRow>
        </SettingsSection>

        {/* AI & Prompting */}
        <SettingsSection title="AI & Prompting" description="Configure how Claude Code processes your prompts.">
          <SettingRow label="Model" description="Choose the Claude model for code generation.">
            <SettingSelect
              value={s.model}
              options={[
                { value: 'sonnet', label: 'Sonnet (fast)' },
                { value: 'opus', label: 'Opus (powerful)' },
                { value: 'haiku', label: 'Haiku (lightweight)' },
              ]}
              onChange={(v) => s.set('ai.model', v)}
            />
          </SettingRow>
          <SettingRow label="Max budget per prompt" description="Maximum USD to spend per prompt. Leave empty for no limit.">
            <SettingInput
              value={s.maxBudget ?? ''}
              type="number"
              placeholder="No limit"
              onChange={(v) => s.set('ai.maxBudget', v === '' || v === 0 ? null : v)}
            />
          </SettingRow>
          <SettingRow label="Permission mode" description="How Claude handles file edits and commands.">
            <SettingSelect
              value={s.permissionMode}
              options={[
                { value: 'bypassPermissions', label: 'Auto-approve all' },
                { value: 'auto', label: 'Smart auto-approve' },
                { value: 'default', label: 'Ask for each' },
              ]}
              onChange={(v) => s.set('ai.permissionMode', v)}
            />
          </SettingRow>
          <Box css={{ padding: '14px 16px' }}>
            <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '4px' }}>
              Custom instructions
            </Text>
            <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', marginBottom: '10px' }}>
              Additional instructions appended to every prompt. Use this to define project-specific conventions.
            </Text>
            <SettingTextarea
              value={s.customInstructions}
              placeholder="e.g. Always use Tailwind for styling. Use snake_case for Python variables."
              onChange={(v) => s.set('ai.customInstructions', v)}
            />
          </Box>
        </SettingsSection>

        {/* Editor */}
        <SettingsSection title="Editor" description="Configure the code viewer and editor behavior.">
          <SettingRow label="Tab size">
            <SettingSelect
              value={String(s.tabSize)}
              options={[
                { value: '2', label: '2 spaces' },
                { value: '4', label: '4 spaces' },
              ]}
              onChange={(v) => s.set('editor.tabSize', Number(v))}
            />
          </SettingRow>
          <SettingRow label="Word wrap" description="Wrap long lines in the editor.">
            <SettingToggle
              value={s.wordWrap}
              onChange={(v) => s.set('editor.wordWrap', v)}
            />
          </SettingRow>
          <SettingRow label="Minimap" description="Show code minimap for long files.">
            <SettingToggle
              value={s.minimap}
              onChange={(v) => s.set('editor.minimap', v)}
            />
          </SettingRow>
          <SettingRow label="Line numbers">
            <SettingToggle
              value={s.lineNumbers}
              onChange={(v) => s.set('editor.lineNumbers', v)}
            />
          </SettingRow>
        </SettingsSection>

        {/* Project */}
        <SettingsSection title="Project" description="Project-level configuration.">
          <SettingRow label="Display name" description="Custom name shown in the sidebar. Defaults to folder name.">
            <SettingInput
              value={s.displayName}
              placeholder="My Project"
              onChange={(v) => s.set('project.displayName', v)}
            />
          </SettingRow>
          <Box css={{ padding: '14px 16px' }}>
            <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '4px' }}>
              Ignored file patterns
            </Text>
            <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', marginBottom: '10px' }}>
              Comma-separated patterns to exclude from the file browser.
            </Text>
            <SettingTextarea
              value={s.ignoredPatterns}
              placeholder="node_modules,.git,__pycache__,venv,dist"
              onChange={(v) => s.set('project.ignoredPatterns', v)}
            />
          </Box>
        </SettingsSection>
      </PageContainer>
    </Box>
  )
}
