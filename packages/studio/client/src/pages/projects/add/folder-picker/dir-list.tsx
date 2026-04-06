import { Box, Text, VStack } from '@chakra-ui/react'
import { Folder, ArrowUp, ChevronRight, FolderSearch } from 'lucide-react'
import type { DirEntry } from './types'

interface DirListProps {
  dirs: DirEntry[]
  parentPath: string | null
  loading: boolean
  onNavigate: (path: string) => void
  emptyMessage?: string
}

export function DirList({ dirs, parentPath, loading, onNavigate, emptyMessage }: DirListProps) {
  if (loading) {
    return (
      <VStack gap={2} css={{ padding: '40px 20px', alignItems: 'center' }}>
        {[1, 2, 3].map((i) => (
          <Box key={i} css={{
            width: '100%', maxWidth: '300px', height: '38px', borderRadius: '8px',
            background: 'var(--studio-bg-surface)', opacity: 0.5 + i * 0.15,
            animation: `shimmer 1.2s ease-in-out ${i * 0.1}s infinite`,
          }} />
        ))}
      </VStack>
    )
  }

  const showEmpty = dirs.length === 0 && !parentPath

  return (
    <VStack gap={0} align="stretch" css={{ padding: '4px 8px' }}>
      {parentPath && (
        <DirRow
          icon={<ArrowUp size={14} />}
          name=".."
          muted
          onClick={() => onNavigate(parentPath)}
        />
      )}
      {showEmpty && (
        <VStack gap={2} css={{ padding: '32px 20px', alignItems: 'center', color: 'var(--studio-text-muted)' }}>
          <FolderSearch size={20} />
          <Text css={{ fontSize: '13px' }}>{emptyMessage || 'No subdirectories'}</Text>
        </VStack>
      )}
      {dirs.map((dir) => (
        <DirRow
          key={dir.path}
          icon={<Folder size={14} />}
          name={dir.name}
          onClick={() => onNavigate(dir.path)}
        />
      ))}
    </VStack>
  )
}

function DirRow({ icon, name, muted, onClick }: {
  icon: React.ReactNode
  name: string
  muted?: boolean
  onClick: () => void
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '8px 12px',
        borderRadius: '8px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        color: muted ? 'var(--studio-text-secondary)' : 'var(--studio-text-primary)',
        fontSize: '13px',
        transition: 'all 0.06s ease',
        '&:hover': {
          background: 'var(--studio-bg-hover)',
          '& .dir-arrow': { opacity: 1 },
        },
      }}
    >
      <Box
        css={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          background: 'var(--studio-bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: muted ? 'var(--studio-text-muted)' : 'var(--studio-text-tertiary)',
          flexShrink: 0,
          transition: 'color 0.06s ease',
        }}
      >
        {icon}
      </Box>
      <Text css={{ flex: 1, fontWeight: muted ? 400 : 500, fontSize: '13px' }}>{name}</Text>
      <Box
        className="dir-arrow"
        css={{
          opacity: 0,
          color: 'var(--studio-text-muted)',
          transition: 'opacity 0.06s ease',
          display: 'flex',
        }}
      >
        <ChevronRight size={14} />
      </Box>
    </Box>
  )
}
