import { useState, useRef } from 'react'
import { Box, Textarea } from '@chakra-ui/react'
import { ArrowUp, Square } from 'lucide-react'
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
    <Box
      css={{
        padding: '12px 24px 20px',
        maxWidth: '720px',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
      }}
    >
      <Box
        css={{
          position: 'relative',
          background: 'var(--studio-bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--studio-border)',
          transition: 'all 0.2s ease',
          boxShadow: 'var(--studio-shadow)',
          '&:focus-within': {
            borderColor: 'rgba(255,255,255,0.2)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.15)',
          },
        }}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Claude to build something..."
          resize="none"
          rows={2}
          disabled={disabled}
          css={{
            minHeight: '52px',
            maxHeight: '200px',
            padding: '14px 56px 14px 18px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--studio-text-primary)',
            fontSize: '14px',
            lineHeight: '1.6',
            '&::placeholder': {
              color: 'var(--studio-text-tertiary)',
            },
            '&:focus': {
              outline: 'none',
              boxShadow: 'none',
              borderColor: 'transparent',
            },
          }}
        />

        {/* Action button */}
        <Box
          css={{
            position: 'absolute',
            right: '10px',
            bottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Cmd+Enter hint */}
          <Box
            as="span"
            css={{
              fontSize: '11px',
              color: 'var(--studio-text-muted)',
              userSelect: 'none',
              letterSpacing: '0.02em',
            }}
          >
            {'\u2318'}Enter
          </Box>

          {isStreaming ? (
            <Tooltip content="Stop generation">
              <Box
                as="button"
                onClick={onCancel}
                css={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--studio-error)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  '&:hover': {
                    background: '#dc2626',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Square size={12} fill="currentColor" />
              </Box>
            </Tooltip>
          ) : (
            <Tooltip content="Send (Cmd+Enter)">
              <Box
                as="button"
                onClick={handleSend}
                css={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: value.trim() && !disabled
                    ? 'var(--studio-accent)'
                    : 'var(--studio-bg-hover)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: value.trim() && !disabled ? 'pointer' : 'default',
                  color: value.trim() && !disabled ? 'var(--studio-accent-fg)' : 'var(--studio-text-muted)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  '&:hover': value.trim() && !disabled ? {
                    transform: 'scale(1.05)',
                  } : {},
                }}
              >
                <ArrowUp size={16} />
              </Box>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  )
}
