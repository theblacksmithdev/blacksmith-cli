import { Box, HStack, Text } from '@chakra-ui/react'
import { Home, ChevronRight } from 'lucide-react'

interface BreadcrumbProps {
  currentPath: string
  onNavigate: (path: string) => void
}

export function Breadcrumb({ currentPath, onNavigate }: BreadcrumbProps) {
  const parts = currentPath.split('/').filter(Boolean)
  // Show last 4 segments max, with ellipsis
  const visibleParts = parts.length > 4 ? parts.slice(-4) : parts
  const truncated = parts.length > 4

  return (
    <Box
      css={{
        padding: '0 20px',
        borderBottom: '1px solid var(--studio-border)',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <HStack
        gap={0}
        css={{
          padding: '8px 0',
          overflow: 'hidden',
          overflowX: 'auto',
          flexWrap: 'nowrap',
          '&::-webkit-scrollbar': { height: '0' },
        }}
      >
        <Crumb onClick={() => onNavigate('/')} isLast={false}>
          <Home size={12} />
        </Crumb>

        {truncated && (
          <>
            <Sep />
            <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)', padding: '0 2px' }}>...</Text>
          </>
        )}

        {visibleParts.map((part, i) => {
          const fullIndex = truncated ? parts.length - visibleParts.length + i : i
          const partPath = '/' + parts.slice(0, fullIndex + 1).join('/')
          const isLast = fullIndex === parts.length - 1
          return (
            <HStack key={fullIndex} gap={0} css={{ flexShrink: 0 }}>
              <Sep />
              <Crumb onClick={() => !isLast && onNavigate(partPath)} isLast={isLast}>
                {part}
              </Crumb>
            </HStack>
          )
        })}
      </HStack>
    </Box>
  )
}

function Sep() {
  return <ChevronRight size={11} style={{ color: 'var(--studio-text-muted)', margin: '0 1px', flexShrink: 0 }} />
}

function Crumb({ children, onClick, isLast }: { children: React.ReactNode; onClick: () => void; isLast: boolean }) {
  return (
    <Box
      as="button"
      onClick={onClick}
      css={{
        border: 'none',
        background: 'none',
        cursor: isLast ? 'default' : 'pointer',
        fontSize: '12px',
        fontWeight: isLast ? 600 : 400,
        color: isLast ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
        padding: '3px 5px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        transition: 'all 0.08s ease',
        '&:hover': isLast ? {} : { color: 'var(--studio-text-primary)', background: 'var(--studio-bg-hover)' },
      }}
    >
      {children}
    </Box>
  )
}
