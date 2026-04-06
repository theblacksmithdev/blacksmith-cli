import { Box, Text } from '@chakra-ui/react'
import { EmptyState } from '@/components/shared/empty-state'
import { Eye, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface FileViewerProps {
  filePath: string | null
  content: string | null
  language: string
  isChanged: boolean
}

export function FileViewer({ filePath, content, language, isChanged }: FileViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!filePath || content === null) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="full">
        <EmptyState
          icon={<Eye size={40} />}
          title="Select a file"
          description="Click a file in the tree to view its contents."
        />
      </Box>
    )
  }

  const lines = content.split('\n')
  const pathParts = filePath.split('/')
  const fileName = pathParts[pathParts.length - 1]

  return (
    <Box h="full" display="flex" flexDir="column">
      {/* Header with breadcrumb */}
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(20,20,22,0.8)',
          gap: '8px',
        }}
      >
        {/* Breadcrumb path */}
        <Box
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {pathParts.map((part, i) => (
            <Box key={i} css={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              {i > 0 && (
                <Text css={{ color: '#55555f', fontSize: '11px' }}>/</Text>
              )}
              <Text
                css={{
                  fontSize: '12px',
                  color: i === pathParts.length - 1 ? '#e8e8ed' : '#55555f',
                  fontWeight: i === pathParts.length - 1 ? 500 : 400,
                }}
              >
                {part}
              </Text>
            </Box>
          ))}
        </Box>

        {isChanged && (
          <Box
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: '#f59e0b',
            }}
          >
            <Box css={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b' }} />
            Modified
          </Box>
        )}

        {/* Language pill */}
        <Box
          css={{
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(255,255,255,0.04)',
            fontSize: '11px',
            color: '#55555f',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          {language}
        </Box>

        {/* Copy button */}
        <Box
          as="button"
          onClick={handleCopy}
          css={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'transparent',
            border: 'none',
            color: copied ? '#10b981' : '#55555f',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: '#1c1c20',
              color: '#85858f',
            },
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </Box>
      </Box>

      {/* Code with line numbers */}
      <Box
        css={{
          flex: 1,
          overflowY: 'auto',
          background: '#0c0c0e',
        }}
      >
        <Box
          as="pre"
          css={{
            display: 'flex',
            margin: 0,
            padding: 0,
            fontSize: '13px',
            fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
            lineHeight: '20px',
          }}
        >
          {/* Line numbers gutter */}
          <Box
            css={{
              padding: '12px 0',
              textAlign: 'right',
              userSelect: 'none',
              flexShrink: 0,
              borderRight: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            {lines.map((_, i) => (
              <Box
                key={i}
                css={{
                  padding: '0 12px',
                  color: '#55555f',
                  fontSize: '12px',
                }}
              >
                {i + 1}
              </Box>
            ))}
          </Box>

          {/* Code content */}
          <Box
            as="code"
            css={{
              padding: '12px 16px',
              overflowX: 'auto',
              color: '#e8e8ed',
              flex: 1,
            }}
          >
            {content}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
