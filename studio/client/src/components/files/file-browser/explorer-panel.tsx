import { Box, Text, HStack } from '@chakra-ui/react'
import { RefreshCw, Search, FolderTree } from 'lucide-react'
import { FileTree } from '../file-tree'
import { Tooltip } from '@/components/shared/tooltip'

interface ExplorerPanelProps {
  tree: any
  activeTab: string | null
  changedFiles: Set<string>
  searchQuery: string
  onSearchChange: (query: string) => void
  onRefresh: () => void
  onSelectFile: (path: string) => void
}

export function ExplorerPanel({
  tree,
  activeTab,
  changedFiles,
  searchQuery,
  onSearchChange,
  onRefresh,
  onSelectFile,
}: ExplorerPanelProps) {
  return (
    <Box
      css={{
        width: '280px',
        background: 'var(--studio-bg-sidebar)',
        borderRight: '1px solid var(--studio-border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Explorer header */}
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderBottom: '1px solid var(--studio-border)',
        }}
      >
        <HStack gap={2}>
          <FolderTree size={14} style={{ color: 'var(--studio-text-tertiary)' }} />
          <Text
            css={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--studio-text-tertiary)',
            }}
          >
            Explorer
          </Text>
        </HStack>
        <Tooltip content="Refresh">
          <Box
            as="button"
            onClick={onRefresh}
            css={{
              width: '24px',
              height: '24px',
              borderRadius: '5px',
              border: 'none',
              background: 'transparent',
              color: 'var(--studio-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              '&:hover': { color: 'var(--studio-text-secondary)', background: 'var(--studio-bg-surface)' },
            }}
          >
            <RefreshCw size={12} />
          </Box>
        </Tooltip>
      </Box>

      {/* Search */}
      <Box css={{ padding: '8px 10px' }}>
        <Box
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 8px',
            borderRadius: '6px',
            background: 'var(--studio-bg-surface)',
            border: '1px solid transparent',
            transition: 'all 0.15s ease',
            '&:focus-within': {
              borderColor: 'var(--studio-border-hover)',
            },
          }}
        >
          <Search size={12} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--studio-text-primary)',
              fontSize: '12px',
            }}
          />
        </Box>
      </Box>

      {/* Tree */}
      <Box css={{ flex: 1, overflowY: 'auto', padding: '0 4px 8px' }}>
        {tree && (
          <FileTree
            tree={tree}
            selectedFile={activeTab}
            changedFiles={changedFiles}
            onSelectFile={onSelectFile}
            searchQuery={searchQuery}
          />
        )}
      </Box>

      {/* Stats bar */}
      {tree && (
        <Box
          css={{
            padding: '8px 14px',
            borderTop: '1px solid var(--studio-border)',
            fontSize: '11px',
            color: 'var(--studio-text-muted)',
          }}
        >
          {tree.children?.length || 0} items
          {changedFiles.size > 0 && (
            <Text as="span" css={{ color: 'var(--studio-warning)', marginLeft: '8px' }}>
              {changedFiles.size} modified
            </Text>
          )}
        </Box>
      )}
    </Box>
  )
}
