import { useState, useEffect } from 'react'
import { Box, Text, useDisclosure } from '@chakra-ui/react'
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
    <Box
      css={{
        padding: '32px 24px',
        maxWidth: '960px',
        margin: '0 auto',
      }}
    >
      <Box css={{ marginBottom: '28px' }}>
        <Text
          css={{
            fontSize: '24px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#e8e8ed',
            marginBottom: '6px',
          }}
        >
          What do you want to build?
        </Text>
        <Text
          css={{
            fontSize: '14px',
            color: '#55555f',
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
    </Box>
  )
}
