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
              color: '#55555f',
              background: 'transparent',
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
            background: '#10b981',
            margin: '12px auto 0',
          }}
        />
      </Box>
    </Box>
  )
}
