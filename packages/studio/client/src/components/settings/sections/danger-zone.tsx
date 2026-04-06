import { useState } from 'react'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2, AlertTriangle, X, FolderX, Database } from 'lucide-react'
import { useProjects } from '@/hooks/use-projects'
import { useProjectStore } from '@/stores/project-store'
import { Path } from '@/router/paths'

type RemoveMode = 'soft' | 'hard' | null

export function DangerZone() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const { remove } = useProjects()
  const activeProject = useProjectStore((s) => s.activeProject)
  const [modalMode, setModalMode] = useState<RemoveMode>(null)
  const [confirmText, setConfirmText] = useState('')
  const [removing, setRemoving] = useState(false)

  const handleRemove = async () => {
    if (!projectId || !modalMode) return
    setRemoving(true)
    try {
      await remove(projectId, modalMode === 'hard')
      navigate(Path.Home)
    } catch {
      setRemoving(false)
    }
  }

  const confirmed = confirmText === activeProject?.name
  const closeModal = () => { setModalMode(null); setConfirmText(''); setRemoving(false) }

  return (
    <>
      <VStack gap={5} align="stretch">
        <Box>
          <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-error)', marginBottom: '4px' }}>
            Danger Zone
          </Text>
          <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)' }}>
            Irreversible actions that affect this project.
          </Text>
        </Box>

        <VStack
          gap={0}
          align="stretch"
          css={{ borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', overflow: 'hidden' }}
        >
          <DangerRow
            title="Remove from Studio"
            description="Unlink this project from Studio. Your files on disk stay untouched. Chat history and settings will be deleted."
            buttonLabel="Remove"
            onClick={() => setModalMode('soft')}
          />
          <DangerRow
            title="Delete project entirely"
            description="Permanently delete the project folder from your disk AND remove all data from Studio. This cannot be undone."
            buttonLabel="Delete everything"
            onClick={() => setModalMode('hard')}
            destructive
          />
        </VStack>
      </VStack>

      {/* Confirmation modal */}
      {modalMode && (
        <>
          <Box
            onClick={closeModal}
            css={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', zIndex: 400,
            }}
          />
          <Box
            css={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '440px', borderRadius: '14px',
              border: '1px solid var(--studio-border-hover)',
              background: 'var(--studio-bg-main)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              zIndex: 401, overflow: 'hidden',
              animation: 'pickerSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header */}
            <HStack gap={3} css={{ padding: '20px 20px 16px' }}>
              <Box css={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(239,68,68,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {modalMode === 'hard'
                  ? <FolderX size={18} style={{ color: 'var(--studio-error)' }} />
                  : <Database size={18} style={{ color: 'var(--studio-error)' }} />}
              </Box>
              <Box css={{ flex: 1 }}>
                <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-text-primary)' }}>
                  {modalMode === 'hard' ? 'Delete project entirely' : 'Remove from Studio'}
                </Text>
                <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)', marginTop: '2px' }}>
                  {activeProject?.name}
                </Text>
              </Box>
              <Box
                as="button"
                onClick={closeModal}
                css={{
                  width: '28px', height: '28px', borderRadius: '7px', border: 'none',
                  background: 'transparent', color: 'var(--studio-text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-primary)' },
                }}
              >
                <X size={16} />
              </Box>
            </HStack>

            {/* Body */}
            <Box css={{ padding: '0 20px 20px' }}>
              <Box
                css={{
                  padding: '12px 14px', borderRadius: '8px', marginBottom: '16px',
                  background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
                }}
              >
                <HStack gap={2} css={{ marginBottom: '6px' }}>
                  <AlertTriangle size={14} style={{ color: 'var(--studio-error)' }} />
                  <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-error)' }}>
                    This action cannot be undone
                  </Text>
                </HStack>
                {modalMode === 'hard' ? (
                  <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
                    This will <strong>permanently delete</strong> the folder at{' '}
                    <code style={{ fontSize: '11px', background: 'var(--studio-bg-surface)', padding: '1px 4px', borderRadius: '3px' }}>{activeProject?.path}</code>{' '}
                    from your disk, along with all chat history and settings in Studio.
                  </Text>
                ) : (
                  <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
                    Your project files will remain on disk. All chat history and settings stored in Studio will be permanently deleted.
                    You can re-add the project later.
                  </Text>
                )}
              </Box>

              <Text css={{ fontSize: '13px', color: 'var(--studio-text-secondary)', marginBottom: '8px' }}>
                Type <strong style={{ color: 'var(--studio-text-primary)' }}>{activeProject?.name}</strong> to confirm:
              </Text>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={activeProject?.name || ''}
                autoFocus
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '7px',
                  border: '1px solid var(--studio-border)', background: 'var(--studio-bg-surface)',
                  color: 'var(--studio-text-primary)', fontSize: '14px', outline: 'none',
                  marginBottom: '16px',
                }}
              />

              <HStack gap={2} justify="end">
                <Box
                  as="button"
                  onClick={closeModal}
                  css={{
                    padding: '8px 16px', borderRadius: '7px', border: 'none',
                    background: 'transparent', color: 'var(--studio-text-tertiary)',
                    fontSize: '13px', cursor: 'pointer',
                    '&:hover': { color: 'var(--studio-text-secondary)' },
                  }}
                >
                  Cancel
                </Box>
                <Box
                  as="button"
                  onClick={confirmed && !removing ? handleRemove : undefined}
                  css={{
                    padding: '8px 18px', borderRadius: '7px', border: 'none',
                    background: confirmed && !removing ? 'var(--studio-error)' : 'var(--studio-bg-surface)',
                    color: confirmed && !removing ? '#fff' : 'var(--studio-text-muted)',
                    fontSize: '13px', fontWeight: 500,
                    cursor: confirmed && !removing ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <Trash2 size={13} />
                  {removing ? 'Removing...' : modalMode === 'hard' ? 'Delete everything' : 'Remove from Studio'}
                </Box>
              </HStack>
            </Box>
          </Box>
        </>
      )}
    </>
  )
}

function DangerRow({ title, description, buttonLabel, onClick, destructive }: {
  title: string
  description: string
  buttonLabel: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <HStack
      gap={4}
      css={{
        padding: '16px',
        borderBottom: '1px solid rgba(239,68,68,0.15)',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box css={{ flex: 1 }}>
        <Text css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '4px' }}>
          {title}
        </Text>
        <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
          {description}
        </Text>
      </Box>
      <Box
        as="button"
        onClick={onClick}
        css={{
          padding: '7px 14px', borderRadius: '7px', whiteSpace: 'nowrap', flexShrink: 0,
          border: destructive ? 'none' : '1px solid var(--studio-error)',
          background: destructive ? 'var(--studio-error)' : 'transparent',
          color: destructive ? '#fff' : 'var(--studio-error)',
          fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          transition: 'all 0.12s ease',
          '&:hover': destructive ? { opacity: 0.9 } : { background: 'rgba(239,68,68,0.1)' },
        }}
      >
        {buttonLabel}
      </Box>
    </HStack>
  )
}
