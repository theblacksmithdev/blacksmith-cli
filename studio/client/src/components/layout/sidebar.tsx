import { Box, VStack, IconButton } from '@chakra-ui/react'
import { Tooltip } from '@/components/shared/tooltip'
import { MessageSquare, Sparkles, FolderTree, History, Settings, Anvil } from 'lucide-react'
import { useUiStore, type ActiveView } from '@/stores/ui-store'

const navItems: { view: ActiveView; icon: typeof MessageSquare; label: string }[] = [
  { view: 'chat', icon: MessageSquare, label: 'Chat' },
  { view: 'templates', icon: Sparkles, label: 'Prompt Templates' },
  { view: 'files', icon: FolderTree, label: 'File Browser' },
  { view: 'activity', icon: History, label: 'Activity Log' },
]

export function Sidebar() {
  const { activeView, setActiveView } = useUiStore()

  return (
    <Box
      as="nav"
      w="64px"
      css={{
        background: '#0a0a0f',
        borderRight: '1px solid rgba(255,255,255,0.06)',
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
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          flexShrink: 0,
        }}
      >
        <Anvil size={20} color="#fff" />
      </Box>

      {/* Nav Items */}
      <VStack gap={1} flex={1}>
        {navItems.map(({ view, icon: Icon, label }) => {
          const isActive = activeView === view
          return (
            <Tooltip key={view} content={label}>
              <IconButton
                aria-label={label}
                variant="ghost"
                size="md"
                onClick={() => setActiveView(view)}
                css={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  color: isActive ? '#ffffff' : '#555568',
                  background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  boxShadow: isActive ? '0 0 20px rgba(99,102,241,0.15)' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: isActive ? 'rgba(99,102,241,0.2)' : '#1a1a26',
                    color: isActive ? '#ffffff' : '#8888a0',
                  },
                }}
              >
                <Icon size={20} />
              </IconButton>
            </Tooltip>
          )
        })}
      </VStack>

      {/* Bottom Settings */}
      <Box css={{ flexShrink: 0 }}>
        <Tooltip content="Settings">
          <IconButton
            aria-label="Settings"
            variant="ghost"
            size="md"
            css={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              color: '#555568',
              background: 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: '#1a1a26',
                color: '#8888a0',
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
            background: '#10b981',
            margin: '12px auto 0',
          }}
        />
      </Box>
    </Box>
  )
}
