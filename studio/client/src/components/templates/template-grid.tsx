import { useState } from 'react'
import { Box, Text, useDisclosure } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { TemplateCard } from './template-card'
import { TemplateModal } from './template-modal'
import { PageContainer } from '@/components/shared/page-container'
import { api } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { useClaude } from '@/hooks/use-claude'
import { useSessions } from '@/hooks/use-sessions'
import { useSessionStore } from '@/stores/session-store'
import { useProjectStore } from '@/stores/project-store'
import { chatPath } from '@/router/paths'
import type { PromptTemplate } from '@/types'

export function TemplateGrid() {
  const { data: templates = [] } = useQuery({
    queryKey: queryKeys.templates,
    queryFn: () => api.get<PromptTemplate[]>('/templates'),
  })
  const [selected, setSelected] = useState<PromptTemplate | null>(null)
  const { open, onOpen, onClose } = useDisclosure()
  const { sendPrompt } = useClaude()
  const { createSession } = useSessions()
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const navigate = useNavigate()

  const handleSelect = (template: PromptTemplate) => {
    setSelected(template)
    onOpen()
  }

  const activeProject = useProjectStore((s) => s.activeProject)

  const handleSubmit = async (prompt: string) => {
    if (!activeProject) return
    let sessionId = activeSessionId
    if (!sessionId) {
      const session = await createSession()
      sessionId = session.id
    }
    sendPrompt(prompt, sessionId!)
    navigate(chatPath(activeProject.id, sessionId!))
  }

  return (
    <PageContainer size="lg">
      <Box css={{ marginBottom: '28px' }}>
        <Text
          css={{
            fontSize: '24px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--studio-text-primary)',
            marginBottom: '6px',
          }}
        >
          What do you want to build?
        </Text>
        <Text
          css={{
            fontSize: '14px',
            color: 'var(--studio-text-tertiary)',
          }}
        >
          Choose a template to get started quickly
        </Text>
      </Box>

      <Box
        css={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
        }}
      >
        {templates.map((t) => (
          <TemplateCard key={t.id} template={t} onClick={() => handleSelect(t)} />
        ))}
      </Box>

      {selected && (
        <TemplateModal
          template={selected}
          isOpen={open}
          onClose={() => { onClose(); setSelected(null) }}
          onSubmit={handleSubmit}
        />
      )}
    </PageContainer>
  )
}
