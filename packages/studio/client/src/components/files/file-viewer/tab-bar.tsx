import { Box, Text, HStack } from '@chakra-ui/react'
import { Copy, Check, FileCode, Circle, X } from 'lucide-react'
import { useState } from 'react'
import { Tooltip } from '@/components/shared/tooltip'
import { useFileStore, type OpenTab } from '@/stores/file-store'

function getFileName(path: string) {
  return path.split('/').pop() || path
}

function TabItem({ tab, isActive }: { tab: OpenTab; isActive: boolean }) {
  const { selectTab, closeTab, changedFiles } = useFileStore()
  const isChanged = changedFiles.has(tab.path)

  return (
    <Box
      as="button"
      onClick={() => selectTab(tab.path)}
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '6px 10px',
        border: 'none',
        borderBottom: isActive ? '2px solid var(--studio-text-primary)' : '2px solid transparent',
        marginBottom: '-1px',
        background: isActive ? 'var(--studio-bg-main)' : 'transparent',
        color: isActive ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
        cursor: 'pointer',
        transition: 'all 0.1s ease',
        whiteSpace: 'nowrap',
        '&:hover': {
          color: 'var(--studio-text-secondary)',
          background: isActive ? 'var(--studio-bg-main)' : 'var(--studio-bg-surface)',
          '& .tab-close': { opacity: 1 },
        },
      }}
    >
      <FileCode size={12} />
      <Text css={{ fontSize: '12px', fontWeight: isActive ? 500 : 400 }}>
        {getFileName(tab.path)}
      </Text>
      {isChanged && (
        <Circle size={6} fill="var(--studio-warning)" style={{ color: 'var(--studio-warning)' }} />
      )}
      <Box
        as="span"
        className="tab-close"
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); closeTab(tab.path) }}
        css={{
          width: '16px',
          height: '16px',
          borderRadius: '3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isActive ? 1 : 0,
          color: 'var(--studio-text-muted)',
          transition: 'all 0.1s ease',
          '&:hover': { background: 'var(--studio-bg-hover)', color: 'var(--studio-text-primary)' },
        }}
      >
        <X size={11} />
      </Box>
    </Box>
  )
}

interface TabBarProps {
  activeFilePath: string
  language: string
  content: string | null
}

export function TabBar({ activeFilePath, language, content }: TabBarProps) {
  const { openTabs, activeTab } = useFileStore()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const pathParts = activeFilePath.split('/')

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
      {/* Tabs */}
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          overflow: 'hidden',
          overflowX: 'auto',
          '&::-webkit-scrollbar': { height: '0px' },
        }}
      >
        {openTabs.map((tab) => (
          <TabItem key={tab.path} tab={tab} isActive={tab.path === activeTab} />
        ))}
      </Box>

      {/* Actions */}
      <HStack gap={1} css={{ paddingRight: '10px', paddingLeft: '8px', flexShrink: 0 }}>
        <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', marginRight: '4px' }}>
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
