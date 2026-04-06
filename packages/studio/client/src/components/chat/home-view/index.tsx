import { Box, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { ChatInput } from '../chat-input'
import { PageContainer } from '@/components/shared/page-container'
import { useClaude } from '@/hooks/use-claude'
import { useSessions } from '@/hooks/use-sessions'
import { useChatStore } from '@/stores/chat-store'
import { useProjectStore } from '@/stores/project-store'
import { chatPath } from '@/router/paths'
import { HomeHero } from './home-hero'
import { QuickActions } from './quick-actions'

export function HomeView() {
  const { sendPrompt } = useClaude()
  const { createSession } = useSessions()
  const { isStreaming } = useChatStore()
  const navigate = useNavigate()

  const activeProject = useProjectStore((s) => s.activeProject)

  const handleSend = async (text: string) => {
    if (!activeProject) return
    const session = await createSession()
    sendPrompt(text, session.id)
    navigate(chatPath(activeProject.id, session.id))
  }

  return (
    <Box display="flex" flexDir="column" h="full">
      <Box flex={1} display="flex" alignItems="center" justifyContent="center" overflow="auto">
        <PageContainer size="md" padded={false}>
          <VStack gap={0} css={{ paddingTop: '40px', paddingBottom: '40px' }}>
            <HomeHero />

            <Box css={{ width: '100%', marginBottom: '48px' }}>
              <ChatInput onSend={handleSend} onCancel={() => {}} isStreaming={isStreaming} />
            </Box>

            <QuickActions onSend={handleSend} onNavigate={navigate} />
          </VStack>
        </PageContainer>
      </Box>
    </Box>
  )
}
