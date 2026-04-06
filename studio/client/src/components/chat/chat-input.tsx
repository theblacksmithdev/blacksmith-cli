import { useState, useRef } from 'react'
import { HStack, Textarea, IconButton } from '@chakra-ui/react'
import { Send, Square } from 'lucide-react'
import { Tooltip } from '@/components/shared/tooltip'

interface ChatInputProps {
  onSend: (text: string) => void
  onCancel: () => void
  isStreaming: boolean
  disabled?: boolean
}

export function ChatInput({ onSend, onCancel, isStreaming, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <HStack
      p={3}
      borderTop="1px solid"
      borderColor="gray.700"
      bg="gray.800"
      gap={2}
      align="end"
    >
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe what you want to build..."
        size="sm"
        resize="none"
        minH="44px"
        maxH="200px"
        rows={2}
        bg="gray.900"
        border="1px solid"
        borderColor="gray.600"
        _focus={{ borderColor: 'blue.400' }}
        disabled={disabled}
      />

      {isStreaming ? (
        <Tooltip content="Stop generation">
          <IconButton
            aria-label="Stop"
            colorPalette="red"
            size="sm"
            onClick={onCancel}
          >
            <Square size={16} />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip content="Send (Cmd+Enter)">
          <IconButton
            aria-label="Send"
            colorPalette="blue"
            size="sm"
            onClick={handleSend}
            disabled={!value.trim() || disabled}
          >
            <Send size={16} />
          </IconButton>
        </Tooltip>
      )}
    </HStack>
  )
}
