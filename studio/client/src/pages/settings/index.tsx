import { useState } from 'react'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { Palette, Sparkles, Code2, FolderTree, AlertTriangle } from 'lucide-react'
import { AppearanceSettings } from '@/components/settings/sections/appearance-settings'
import { AiSettings } from '@/components/settings/sections/ai-settings'
import { EditorSettings } from '@/components/settings/sections/editor-settings'
import { ProjectSettings } from '@/components/settings/sections/project-settings'
import { DangerZone } from '@/components/settings/sections/danger-zone'
import { useProjectStore } from '@/stores/project-store'

const sections = [
  { id: 'appearance', icon: Palette, label: 'Appearance', group: 'general' },
  { id: 'ai', icon: Sparkles, label: 'AI & Prompting', group: 'general' },
  { id: 'editor', icon: Code2, label: 'Editor', group: 'general' },
  { id: 'project', icon: FolderTree, label: 'Project', group: 'general' },
  { id: 'danger', icon: AlertTriangle, label: 'Danger Zone', group: 'danger' },
] as const

const panels: Record<string, () => JSX.Element> = {
  appearance: AppearanceSettings,
  ai: AiSettings,
  editor: EditorSettings,
  project: ProjectSettings,
  danger: DangerZone,
}

export default function SettingsPage() {
  const [active, setActive] = useState('appearance')
  const activeProject = useProjectStore((s) => s.activeProject)
  const ActivePanel = panels[active]

  const generalSections = sections.filter((s) => s.group === 'general')
  const dangerSections = sections.filter((s) => s.group === 'danger')

  return (
    <HStack gap={0} align="stretch" css={{ height: '100%' }}>
      {/* Inner sidebar */}
      <Box
        css={{
          width: '220px',
          flexShrink: 0,
          borderRight: '1px solid var(--studio-border)',
          background: 'var(--studio-bg-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 0',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <Box css={{ padding: '0 20px', marginBottom: '20px' }}>
          <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
            Settings
          </Text>
          {activeProject && (
            <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeProject.name}
            </Text>
          )}
        </Box>

        {/* General sections */}
        <VStack gap={0} align="stretch" css={{ padding: '0 8px' }}>
          {generalSections.map(({ id, icon: Icon, label }) => {
            const isActive = active === id
            return (
              <Box
                key={id}
                as="button"
                onClick={() => setActive(id)}
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '8px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: isActive ? 'var(--studio-bg-hover)' : 'transparent',
                  color: isActive ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
                  fontSize: '13px',
                  fontWeight: isActive ? 500 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.1s ease',
                  '&:hover': {
                    background: isActive ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)',
                    color: 'var(--studio-text-secondary)',
                  },
                }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                {label}
              </Box>
            )
          })}
        </VStack>

        <Box css={{ flex: 1 }} />

        {/* Danger zone — at the bottom */}
        <VStack gap={0} align="stretch" css={{ padding: '0 8px', borderTop: '1px solid var(--studio-border)', paddingTop: '8px', marginTop: '8px' }}>
          {dangerSections.map(({ id, icon: Icon, label }) => {
            const isActive = active === id
            return (
              <Box
                key={id}
                as="button"
                onClick={() => setActive(id)}
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '8px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: isActive ? 'rgba(239,68,68,0.08)' : 'transparent',
                  color: isActive ? 'var(--studio-error)' : 'var(--studio-text-muted)',
                  fontSize: '13px',
                  fontWeight: isActive ? 500 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.1s ease',
                  '&:hover': {
                    background: isActive ? 'rgba(239,68,68,0.08)' : 'var(--studio-bg-surface)',
                    color: isActive ? 'var(--studio-error)' : 'var(--studio-text-tertiary)',
                  },
                }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                {label}
              </Box>
            )
          })}
        </VStack>
      </Box>

      {/* Content */}
      <Box
        css={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px 40px 64px',
        }}
      >
        <Box css={{ maxWidth: '600px' }}>
          <ActivePanel />
        </Box>
      </Box>
    </HStack>
  )
}
