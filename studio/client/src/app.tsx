import { Box, HStack } from '@chakra-ui/react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ChatView } from '@/components/chat/chat-view'
import { TemplateGrid } from '@/components/templates/template-grid'
import { FileBrowser } from '@/components/files/file-browser'
import { ActivityLog } from '@/components/activity/activity-log'
import { useUiStore } from '@/stores/ui-store'

function MainContent() {
  const activeView = useUiStore((s) => s.activeView)

  switch (activeView) {
    case 'chat':
      return <ChatView />
    case 'templates':
      return <TemplateGrid />
    case 'files':
      return <FileBrowser />
    case 'activity':
      return <ActivityLog />
  }
}

export function App() {
  return (
    <HStack h="100vh" gap={0} align="stretch">
      <Sidebar />
      <Box flex={1} display="flex" flexDir="column" minW={0}>
        <Header />
        <Box flex={1} overflow="hidden">
          <MainContent />
        </Box>
      </Box>
    </HStack>
  )
}
