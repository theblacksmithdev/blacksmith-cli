import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Code,
  Layers,
  Database,
  Shield,
  FileCode2,
  Bug,
  Sparkles,
  Anvil,
} from 'lucide-react'
import { ChatInput } from './chat-input'
import { PageContainer } from '@/components/shared/page-container'
import { useClaude } from '@/hooks/use-claude'
import { useSessions } from '@/hooks/use-sessions'
import { useChatStore } from '@/stores/chat-store'
import { Path, chatPath } from '@/router/paths'

const quickActions = [
  {
    icon: Layers,
    label: 'Create a resource',
    desc: 'Full-stack model, API & pages',
    prompt: 'Help me create a new full-stack resource with Django model, serializer, API viewset, and React pages.',
  },
  {
    icon: FileCode2,
    label: 'Add a page',
    desc: 'New route with components',
    prompt: 'Help me create a new page with proper routing, layout, and components.',
  },
  {
    icon: Database,
    label: 'Build an API',
    desc: 'Django REST endpoint',
    prompt: 'Help me create a new Django REST API endpoint with serializer and views.',
  },
  {
    icon: Shield,
    label: 'Add auth',
    desc: 'Login, register & guards',
    prompt: 'Help me add authentication with login, registration, and route protection.',
  },
  {
    icon: Bug,
    label: 'Fix a bug',
    desc: 'Debug and resolve issues',
    prompt: 'Help me investigate and fix a bug in my project.',
  },
  {
    icon: Code,
    label: 'Write tests',
    desc: 'Unit & integration tests',
    prompt: 'Help me write tests for my existing code using the project testing patterns.',
  },
]

export function HomeView() {
  const { sendPrompt } = useClaude()
  const { createSession } = useSessions()
  const { isStreaming } = useChatStore()
  const navigate = useNavigate()

  const handleSend = async (text: string) => {
    const session = await createSession()
    sendPrompt(text, session.id)
    navigate(chatPath(session.id))
  }

  return (
    <Box display="flex" flexDir="column" h="full">
      <Box flex={1} display="flex" alignItems="center" justifyContent="center" overflow="auto">
        <PageContainer size="md" padded={false}>
          <VStack gap={0} css={{ paddingTop: '40px', paddingBottom: '40px' }}>
            <Box
              css={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'var(--studio-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px',
              }}
            >
              <Anvil size={26} color="var(--studio-accent-fg)" />
            </Box>

            <Text
              css={{
                fontSize: '28px',
                fontWeight: 600,
                letterSpacing: '-0.03em',
                color: 'var(--studio-text-primary)',
                textAlign: 'center',
                lineHeight: 1.3,
                marginBottom: '8px',
              }}
            >
              What are we building today?
            </Text>
            <Text
              css={{
                fontSize: '15px',
                color: 'var(--studio-text-tertiary)',
                textAlign: 'center',
                lineHeight: 1.6,
                marginBottom: '40px',
              }}
            >
              Describe your idea or pick a starting point below.
            </Text>

            <Box css={{ width: '100%', marginBottom: '48px' }}>
              <ChatInput onSend={handleSend} onCancel={() => {}} isStreaming={isStreaming} />
            </Box>

            <Box css={{ width: '100%' }}>
              <Text
                css={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--studio-text-tertiary)',
                  marginBottom: '14px',
                }}
              >
                Quick start
              </Text>

              <Box
                css={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1px',
                  background: 'var(--studio-border)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid var(--studio-border)',
                }}
              >
                {quickActions.map(({ icon: Icon, label, desc, prompt }) => (
                  <Box
                    key={label}
                    as="button"
                    onClick={() => handleSend(prompt)}
                    css={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '20px 18px',
                      background: 'var(--studio-bg-sidebar)',
                      color: 'var(--studio-text-secondary)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                      border: 'none',
                      '&:hover': {
                        background: 'var(--studio-bg-surface)',
                        color: 'var(--studio-text-primary)',
                        '& .action-icon': {
                          color: 'var(--studio-text-primary)',
                          borderColor: 'var(--studio-border-hover)',
                        },
                        '& .action-arrow': {
                          opacity: 1,
                          transform: 'translateX(0)',
                        },
                      },
                    }}
                  >
                    <HStack gap={2} justify="space-between" w="full">
                      <Box
                        className="action-icon"
                        css={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid var(--studio-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--studio-text-tertiary)',
                          transition: 'all 0.15s ease',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={15} />
                      </Box>
                      <Box
                        className="action-arrow"
                        css={{
                          opacity: 0,
                          transform: 'translateX(-4px)',
                          transition: 'all 0.15s ease',
                          color: 'var(--studio-text-tertiary)',
                        }}
                      >
                        <ArrowRight size={13} />
                      </Box>
                    </HStack>
                    <Box>
                      <Text css={{ fontSize: '13px', fontWeight: 500, color: 'inherit', marginBottom: '2px' }}>
                        {label}
                      </Text>
                      <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)' }}>
                        {desc}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box
              as="button"
              onClick={() => navigate(Path.Templates)}
              css={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '20px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--studio-text-tertiary)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': {
                  color: 'var(--studio-text-primary)',
                  background: 'var(--studio-border)',
                },
              }}
            >
              <Sparkles size={14} />
              Browse all templates
              <ArrowRight size={12} />
            </Box>
          </VStack>
        </PageContainer>
      </Box>
    </Box>
  )
}
