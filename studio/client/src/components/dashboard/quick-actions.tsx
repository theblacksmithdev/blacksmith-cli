import { Box, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, FolderTree, Play, Sparkles } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { newChatPath, codePath, runPath, templatesPath } from '@/router/paths'

export function QuickActions() {
  const navigate = useNavigate()
  const activeProject = useProjectStore((s) => s.activeProject)

  if (!activeProject) return null

  const pid = activeProject.id
  const actions = [
    { icon: MessageSquare, label: 'New Chat', desc: 'Start a conversation with Claude', path: newChatPath(pid) },
    { icon: FolderTree, label: 'Browse Code', desc: 'Explore your project files', path: codePath(pid) },
    { icon: Play, label: 'Run Project', desc: 'Start your dev servers', path: runPath(pid) },
    { icon: Sparkles, label: 'Templates', desc: 'Use a prompt template', path: templatesPath(pid) },
  ]

  return (
    <Box css={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
      {actions.map(({ icon: Icon, label, desc, path }) => (
        <Box
          key={label}
          as="button"
          onClick={() => navigate(path)}
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            borderRadius: '10px',
            border: '1px solid var(--studio-border)',
            background: 'var(--studio-bg-sidebar)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.12s ease',
            '&:hover': {
              background: 'var(--studio-bg-hover)',
              borderColor: 'var(--studio-border-hover)',
              '& .action-icon': { color: 'var(--studio-text-primary)' },
            },
          }}
        >
          <Box
            className="action-icon"
            css={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--studio-bg-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--studio-text-tertiary)',
              transition: 'color 0.12s ease',
              flexShrink: 0,
            }}
          >
            <Icon size={16} />
          </Box>
          <Box>
            <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>{label}</Text>
            <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)' }}>{desc}</Text>
          </Box>
        </Box>
      ))}
    </Box>
  )
}
