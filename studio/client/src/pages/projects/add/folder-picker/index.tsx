import { useEffect, useState, useMemo } from 'react'
import { Box, Text, HStack } from '@chakra-ui/react'
import { FolderOpen, X, Search, Anvil, Package } from 'lucide-react'
import { useBrowse } from './use-browse'
import { Breadcrumb } from './breadcrumb'
import { DirList } from './dir-list'

interface FolderPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (path: string) => void
}

export function FolderPicker({ open, onClose, onSelect }: FolderPickerProps) {
  const { data, loading, browse } = useBrowse()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (open && !data) browse()
  }, [open, data, browse])

  // Reset search when navigating
  useEffect(() => {
    setSearch('')
  }, [data?.current])

  const filteredDirs = useMemo(() => {
    if (!data || !search.trim()) return data?.dirs ?? []
    const q = search.toLowerCase()
    return data.dirs.filter((d) => d.name.toLowerCase().includes(q))
  }, [data, search])

  if (!open) return null

  const currentName = data?.current.split('/').pop() || 'folder'
  const canGoUp = data ? data.current !== data.parent : false

  return (
    <>
      {/* Backdrop */}
      <Box
        onClick={onClose}
        css={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 300,
          animation: 'pickerFadeIn 0.15s ease',
        }}
      />

      {/* Modal */}
      <Box
        css={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '560px',
          height: '520px',
          borderRadius: '16px',
          border: '1px solid var(--studio-border-hover)',
          background: 'var(--studio-bg-main)',
          boxShadow: '0 32px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset',
          zIndex: 301,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'pickerSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <Box
          css={{
            padding: '18px 20px 14px',
            flexShrink: 0,
          }}
        >
          <HStack gap={3} css={{ marginBottom: '14px' }}>
            <Box
              css={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                background: 'var(--studio-bg-surface)',
                border: '1px solid var(--studio-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--studio-text-tertiary)',
                flexShrink: 0,
              }}
            >
              <FolderOpen size={16} />
            </Box>
            <Box css={{ flex: 1 }}>
              <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
                Select a folder
              </Text>
              <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)', marginTop: '1px' }}>
                Navigate to your project directory
              </Text>
            </Box>
            <Box
              as="button"
              onClick={onClose}
              css={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: 'var(--studio-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
                '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-primary)' },
              }}
            >
              <X size={16} />
            </Box>
          </HStack>

          {/* Search */}
          <Box
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '9px',
              background: 'var(--studio-bg-surface)',
              border: '1px solid var(--studio-border)',
              transition: 'border-color 0.12s ease',
              '&:focus-within': { borderColor: 'var(--studio-border-hover)' },
            }}
          >
            <Search size={14} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search folders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--studio-text-primary)',
                fontSize: '13px',
              }}
            />
            {search && (
              <Box
                as="button"
                onClick={() => setSearch('')}
                css={{
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: 'var(--studio-text-muted)', display: 'flex', padding: '2px',
                  '&:hover': { color: 'var(--studio-text-secondary)' },
                }}
              >
                <X size={12} />
              </Box>
            )}
          </Box>
        </Box>

        {/* Breadcrumb */}
        {data && <Breadcrumb currentPath={data.current} onNavigate={browse} />}

        {/* Directory list */}
        <Box css={{ flex: 1, overflowY: 'auto' }}>
          {data && (
            <DirList
              dirs={filteredDirs}
              parentPath={!search && canGoUp ? data.parent : null}
              loading={loading}
              onNavigate={browse}
              emptyMessage={search ? `No folders matching "${search}"` : 'No subdirectories here'}
            />
          )}
        </Box>

        {/* Footer */}
        {data && (
          <Box
            css={{
              padding: '12px 20px',
              borderTop: '1px solid var(--studio-border)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--studio-bg-sidebar)',
            }}
          >
            <HStack gap={2} css={{ flex: 1 }}>
              {data.isBlacksmithProject && (
                <Box css={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '3px 8px', borderRadius: '5px',
                  background: 'rgba(16,163,127,0.08)', border: '1px solid rgba(16,163,127,0.15)',
                  fontSize: '11px', fontWeight: 500, color: 'var(--studio-green)',
                }}>
                  <Anvil size={11} /> Blacksmith
                </Box>
              )}
              {data.isProject && !data.isBlacksmithProject && (
                <Box css={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '3px 8px', borderRadius: '5px',
                  background: 'var(--studio-bg-surface)', border: '1px solid var(--studio-border)',
                  fontSize: '11px', fontWeight: 500, color: 'var(--studio-text-tertiary)',
                }}>
                  <Package size={11} /> Project
                </Box>
              )}
              <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {data.dirs.length} folder{data.dirs.length !== 1 ? 's' : ''}
              </Text>
            </HStack>

            <Box
              as="button"
              onClick={() => { onSelect(data.current); onClose() }}
              css={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--studio-accent)',
                color: 'var(--studio-accent-fg)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                whiteSpace: 'nowrap',
                '&:hover': { opacity: 0.85 },
              }}
            >
              Select
            </Box>
          </Box>
        )}
      </Box>
    </>
  )
}
