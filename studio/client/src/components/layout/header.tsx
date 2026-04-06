import {
  HStack,
  Text,
  Button,
  Badge,
  Spacer,
} from '@chakra-ui/react'
import { Plus, Anvil } from 'lucide-react'
import { useSessionStore } from '@/stores/session-store'
import { useUiStore } from '@/stores/ui-store'
import { useSessions } from '@/hooks/use-sessions'

export function Header() {
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const sessions = useSessionStore((s) => s.sessions)
  const connectionStatus = useUiStore((s) => s.connectionStatus)
  const { createSession } = useSessions()

  const activeSession = sessions.find((s) => s.id === activeSessionId)

  return (
    <HStack
      px={4}
      py={2}
      borderBottom="1px solid"
      borderColor="gray.700"
      bg="gray.800"
      h="50px"
    >
      <HStack gap={2}>
        <Anvil size={18} />
        <Text fontWeight="bold" fontSize="sm">Blacksmith Studio</Text>
      </HStack>

      {activeSession && (
        <Text fontSize="sm" color="gray.400" ml={4}>
          {activeSession.name}
        </Text>
      )}

      <Spacer />

      <Badge
        colorPalette={connectionStatus === 'connected' ? 'green' : 'red'}
        variant="subtle"
        fontSize="xs"
      >
        {connectionStatus}
      </Badge>

      <Button
        size="sm"
        colorPalette="blue"
        variant="outline"
        onClick={() => createSession()}
      >
        <Plus size={14} />
        New Chat
      </Button>
    </HStack>
  )
}
