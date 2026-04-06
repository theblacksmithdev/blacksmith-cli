import { useState } from 'react'
import { Box, Text, HStack } from '@chakra-ui/react'
import { Palette, Sparkles, Code2, FolderTree } from 'lucide-react'
import { AppearanceSettings } from '@/components/settings/sections/appearance-settings'
import { AiSettings } from '@/components/settings/sections/ai-settings'
import { EditorSettings } from '@/components/settings/sections/editor-settings'
import { ProjectSettings } from '@/components/settings/sections/project-settings'

const tabs = [
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'ai', icon: Sparkles, label: 'AI & Prompting' },
  { id: 'editor', icon: Code2, label: 'Editor' },
  { id: 'project', icon: FolderTree, label: 'Project' },
] as const

const panels: Record<string, () => JSX.Element> = {
  appearance: AppearanceSettings,
  ai: AiSettings,
  editor: EditorSettings,
  project: ProjectSettings,
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('appearance')
  const ActivePanel = panels[activeTab]

  return (
    <Box css={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header + Tabs */}
      <Box
        css={{
          flexShrink: 0,
          borderBottom: '1px solid var(--studio-border)',
          padding: '20px 32px 0',
        maxWidth: '720px',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
        }}
      >
        <Text
          css={{
            fontSize: '18px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--studio-text-primary)',
            marginBottom: '16px',
          }}
        >
          Settings
        </Text>

        {/* Tab bar */}
        <HStack gap={0}>
          {tabs.map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id
            return (
              <Box
                key={id}
                as="button"
                onClick={() => setActiveTab(id)}
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  border: 'none',
                  background: 'none',
                  color: isActive ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
                  fontSize: '13px',
                  fontWeight: isActive ? 500 : 400,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'color 0.15s ease',
                  marginBottom: '-1px',
                  '&:hover': {
                    color: 'var(--studio-text-secondary)',
                  },
                  '&::after': isActive ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '14px',
                    right: '14px',
                    height: '2px',
                    borderRadius: '1px',
                    background: 'var(--studio-text-primary)',
                  } : {},
                }}
              >
                <Icon size={14} />
                {label}
              </Box>
            )
          })}
        </HStack>
      </Box>

      {/* Content */}
      <Box
        css={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px 32px 64px',
          maxWidth: '720px',
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '100%',
        }}
      >
        <ActivePanel />
      </Box>
    </Box>
  )
}
