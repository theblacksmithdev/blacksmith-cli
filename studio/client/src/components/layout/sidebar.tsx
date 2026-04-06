import { Box, VStack, IconButton } from '@chakra-ui/react'
import { Tooltip } from '@/components/shared/tooltip'
import { useNavigate, useLocation } from 'react-router-dom'
import { MessageSquare, Sparkles, FolderTree, History, Settings, Anvil } from 'lucide-react'
import { useUiStore } from '@/stores/ui-store'
import { Path } from '@/router/paths'

const navItems = [
  { path: Path.Chat, icon: MessageSquare, label: 'Chat' },
  { path: Path.Templates, icon: Sparkles, label: 'Templates' },
  { path: Path.Files, icon: FolderTree, label: 'Files' },
  { path: Path.Activity, icon: History, label: 'Activity' },
] as const

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const connectionStatus = useUiStore((s) => s.connectionStatus)

  return (
    <Box
      as="nav"
      w="64px"
      css={{
        background: '#0c0c0e',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '16px',
        paddingBottom: '16px',
      }}
    >
      {/* Logo */}
      <Box
        css={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          flexShrink: 0,
        }}
      >
        <Anvil size={22} color="#14b8a6" />
      </Box>

      {/* Nav Items */}
      <VStack gap={1} flex={1}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path
          return (
            <Tooltip key={path} content={label}>
              <IconButton
                aria-label={label}
                variant="ghost"
                size="md"
                onClick={() => navigate(path)}
                css={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  color: isActive ? '#14b8a6' : '#55555f',
                  background: isActive ? 'rgba(13,148,136,0.12)' : 'transparent',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: isActive ? 'rgba(13,148,136,0.15)' : '#1c1c20',
                    color: isActive ? '#14b8a6' : '#85858f',
                  },
                }}
              >
                <Icon size={20} />
              </IconButton>
            </Tooltip>
          )
        })}
      </VStack>

      {/* Bottom */}
      <Box css={{ flexShrink: 0 }}>
        <Tooltip content="Settings">
          <IconButton
            aria-label="Settings"
            variant="ghost"
            size="md"
            onClick={() => navigate(Path.Settings)}
            css={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              color: location.pathname === Path.Settings ? '#14b8a6' : '#55555f',
              background: location.pathname === Path.Settings ? 'rgba(13,148,136,0.12)' : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: '#1c1c20',
                color: '#85858f',
              },
            }}
          >
            <Settings size={18} />
          </IconButton>
        </Tooltip>

        {/* Connection dot */}
        <Box
          css={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: connectionStatus === 'connected' ? '#10b981' : '#ef4444',
            margin: '12px auto 0',
            boxShadow: connectionStatus === 'connected'
              ? '0 0 6px rgba(16,185,129,0.4)'
              : '0 0 6px rgba(239,68,68,0.4)',
          }}
        />
      </Box>
    </Box>
  )
}
