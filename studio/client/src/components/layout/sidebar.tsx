import { Box, VStack, IconButton, Separator } from '@chakra-ui/react'
import { Tooltip } from '@/components/shared/tooltip'
import { MessageSquare, Sparkles, FolderTree, History, PanelLeftClose, PanelLeft } from 'lucide-react'
import { useUiStore, type ActiveView } from '@/stores/ui-store'

const navItems: { view: ActiveView; icon: typeof MessageSquare; label: string }[] = [
  { view: 'chat', icon: MessageSquare, label: 'Chat' },
  { view: 'templates', icon: Sparkles, label: 'Prompt Templates' },
  { view: 'files', icon: FolderTree, label: 'File Browser' },
  { view: 'activity', icon: History, label: 'Activity Log' },
]

export function Sidebar() {
  const { activeView, setActiveView, sidebarCollapsed, toggleSidebar } = useUiStore()

  return (
    <Box
      as="nav"
      w="60px"
      bg="gray.800"
      borderRight="1px solid"
      borderColor="gray.700"
      py={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <VStack gap={1} flex={1}>
        {navItems.map(({ view, icon: Icon, label }) => (
          <Tooltip key={view} content={label}>
            <IconButton
              aria-label={label}
              variant={activeView === view ? 'solid' : 'ghost'}
              colorPalette={activeView === view ? 'blue' : 'gray'}
              size="md"
              onClick={() => setActiveView(view)}
            >
              <Icon size={20} />
            </IconButton>
          </Tooltip>
        ))}
      </VStack>

      <Separator borderColor="gray.700" my={2} />

      <Tooltip content={sidebarCollapsed ? 'Expand' : 'Collapse'}>
        <IconButton
          aria-label="Toggle sidebar"
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </IconButton>
      </Tooltip>
    </Box>
  )
}
