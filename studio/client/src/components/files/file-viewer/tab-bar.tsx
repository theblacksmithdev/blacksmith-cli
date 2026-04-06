import { Box, Text, HStack } from '@chakra-ui/react'
import { Copy, Check, FileCode, Circle, X } from 'lucide-react'
import { useState } from 'react'
import { Tooltip } from '@/components/shared/tooltip'

interface TabBarProps {
  filePath: string
  language: string
  isChanged: boolean
  content: string | null
  onClose: () => void
}

export function TabBar({ filePath, language, isChanged, content, onClose }: TabBarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const pathParts = filePath.split('/')
  const fileName = pathParts[pathParts.length - 1]

  return (
    <Box
      css={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--studio-border)',
        background: 'var(--studio-bg-sidebar)',
        flexShrink: 0,
      }}
    >
      {/* Active tab */}
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderBottom: '2px solid var(--studio-text-primary)',
          marginBottom: '-1px',
          background: 'var(--studio-bg-main)',
        }}
      >
        <FileCode size={13} style={{ color: 'var(--studio-text-tertiary)' }} />
        <Text css={{ fontSize: '12px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>
          {fileName}
        </Text>
        {isChanged && (
          <Circle size={7} fill="var(--studio-warning)" style={{ color: 'var(--studio-warning)' }} />
        )}
        <Box
          as="button"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onClose() }}
          css={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            border: 'none',
            background: 'transparent',
            color: 'var(--studio-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginLeft: '2px',
            transition: 'all 0.12s ease',
            '&:hover': { background: 'var(--studio-bg-hover)', color: 'var(--studio-text-primary)' },
          }}
        >
          <X size={12} />
        </Box>
      </Box>

      <Box css={{ flex: 1 }} />

      {/* Actions */}
      <HStack gap={1} css={{ paddingRight: '10px' }}>
        <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', marginRight: '8px' }}>
          {pathParts.slice(0, -1).join(' / ')}
        </Text>

        <Box
          css={{
            padding: '2px 7px',
            borderRadius: '4px',
            background: 'var(--studio-bg-surface)',
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--studio-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {language}
        </Box>

        <Tooltip content={copied ? 'Copied!' : 'Copy file'}>
          <Box
            as="button"
            onClick={handleCopy}
            css={{
              width: '26px',
              height: '26px',
              borderRadius: '5px',
              background: 'transparent',
              border: 'none',
              color: copied ? 'var(--studio-green)' : 'var(--studio-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-secondary)' },
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </Box>
        </Tooltip>
      </HStack>
    </Box>
  )
}
