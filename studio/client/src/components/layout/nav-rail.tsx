import { Box, VStack } from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  MessageSquare,
  FolderTree,
  Play,
  Sparkles,
  History,
  Settings,
  Anvil,
  Sun,
  Moon,
} from 'lucide-react'
import { Tooltip } from '@/components/shared/tooltip'
import { useUiStore } from '@/stores/ui-store'
import { useThemeMode } from '@/hooks/use-theme-mode'
import { Path } from '@/router/paths'

const railBtn = (active = false) => ({
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  border: 'none',
  background: active ? 'var(--studio-bg-hover)' : 'transparent',
  color: active ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.12s ease',
  '&:hover': {
    background: active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)',
    color: active ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)',
  },
})

const topNav = [
  { path: Path.Home, match: (p: string) => p === '/' || p.startsWith('/chat'), icon: MessageSquare, label: 'Chat' },
  { path: Path.Code, match: (p: string) => p === '/code', icon: FolderTree, label: 'Code' },
  { path: Path.Run, match: (p: string) => p === '/run', icon: Play, label: 'Run' },
  { path: Path.Templates, match: (p: string) => p === '/templates', icon: Sparkles, label: 'Templates' },
] as const

const bottomNav = [
  { path: Path.Activity, match: (p: string) => p === '/activity', icon: History, label: 'History' },
  { path: Path.Settings, match: (p: string) => p === '/settings', icon: Settings, label: 'Settings' },
] as const

export function NavRail() {
  const navigate = useNavigate()
  const location = useLocation()
  const connectionStatus = useUiStore((s) => s.connectionStatus)
  const { mode, toggle: toggleTheme } = useThemeMode()

  return (
    <Box
      as="nav"
      css={{
        width: '56px',
        background: 'var(--studio-bg-sidebar)',
        borderRight: '1px solid var(--studio-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        flexShrink: 0,
        paddingTop: '12px',
        paddingBottom: '10px',
      }}
    >
      {/* Logo — new chat */}
      <Tooltip content="New chat">
        <Box
          as="button"
          onClick={() => navigate(Path.NewChat)}
          css={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--studio-accent)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'opacity 0.15s ease',
            '&:hover': { opacity: 0.85 },
          }}
        >
          <Anvil size={15} color="var(--studio-accent-fg)" />
        </Box>
      </Tooltip>

      {/* Top nav */}
      <VStack gap={1} flex={1}>
        {topNav.map(({ path, match, icon: Icon, label }) => (
          <Tooltip key={path} content={label}>
            <Box as="button" onClick={() => navigate(path)} css={railBtn(match(location.pathname))}>
              <Icon size={18} />
            </Box>
          </Tooltip>
        ))}
      </VStack>

      {/* Bottom nav */}
      <VStack
        gap={1}
        css={{
          borderTop: '1px solid var(--studio-border)',
          paddingTop: '8px',
          marginTop: '4px',
          flexShrink: 0,
        }}
      >
        {bottomNav.map(({ path, match, icon: Icon, label }) => (
          <Tooltip key={path} content={label}>
            <Box as="button" onClick={() => navigate(path)} css={railBtn(match(location.pathname))}>
              <Icon size={18} />
            </Box>
          </Tooltip>
        ))}

        {/* Theme toggle */}
        <Tooltip content={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <Box
            as="button"
            onClick={toggleTheme}
            css={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--studio-border)',
              background: 'var(--studio-bg-surface)',
              color: 'var(--studio-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              marginTop: '4px',
              '&:hover': {
                background: 'var(--studio-bg-hover)',
                color: 'var(--studio-text-primary)',
                borderColor: 'var(--studio-border-hover)',
              },
            }}
          >
            {mode === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </Box>
        </Tooltip>

        {/* Connection dot */}
        <Box
          css={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: connectionStatus === 'connected' ? 'var(--studio-green)' : 'var(--studio-error)',
            marginTop: '6px',
          }}
        />
      </VStack>
    </Box>
  )
}
