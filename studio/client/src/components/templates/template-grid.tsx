import { useState, useEffect } from 'react'
import { Box, SimpleGrid, Heading, useDisclosure } from '@chakra-ui/react'
import { TemplateCard } from './template-card'
import { TemplateModal } from './template-modal'
import { useClaude } from '@/hooks/use-claude'
import { useSessions } from '@/hooks/use-sessions'
import { useSessionStore } from '@/stores/session-store'
import { useUiStore } from '@/stores/ui-store'
import type { PromptTemplate } from '@/types'

export function TemplateGrid() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [selected, setSelected] = useState<PromptTemplate | null>(null)
  const { open, onOpen, onClose } = useDisclosure()
  const { sendPrompt } = useClaude()
  const { createSession } = useSessions()
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const setActiveView = useUiStore((s) => s.setActiveView)

  useEffect(() => {
    fetch('/api/templates')
      .then((r) => r.json())
      .then(setTemplates)
      .catch(() => {})
  }, [])

  const handleSelect = (template: PromptTemplate) => {
    setSelected(template)
    onOpen()
  }

  const handleSubmit = async (prompt: string) => {
    let sessionId = activeSessionId
    if (!sessionId) {
      const session = await createSession()
      sessionId = session.id
    }
    sendPrompt(prompt, sessionId!)
    setActiveView('chat')
  }

  return (
    <Box p={6}>
      <Heading size="md" mb={4}>Prompt Templates</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {templates.map((t) => (
          <TemplateCard key={t.id} template={t} onClick={() => handleSelect(t)} />
        ))}
      </SimpleGrid>

      {selected && (
        <TemplateModal
          template={selected}
          isOpen={open}
          onClose={() => { onClose(); setSelected(null) }}
          onSubmit={handleSubmit}
        />
      )}
    </Box>
  )
}
