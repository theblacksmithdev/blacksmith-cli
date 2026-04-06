import { useState } from 'react'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { FolderOpen, Trash2, Check, FolderPlus } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { Tooltip } from '@/components/shared/tooltip'
import { useProjects } from '@/hooks/use-projects'
import { useProjectStore, type Project } from '@/stores/project-store'

export default function ProjectsPage() {
  const { projects, register, activate, remove } = useProjects()
  const activeProject = useProjectStore((s) => s.activeProject)
  const [showRegister, setShowRegister] = useState(false)
  const [newPath, setNewPath] = useState('')
  const [newName, setNewName] = useState('')

  const handleRegister = async () => {
    if (!newPath.trim()) return
    await register(newPath.trim(), newName.trim() || undefined)
    setNewPath('')
    setNewName('')
    setShowRegister(false)
  }

  return (
    <Box css={{ height: '100%', overflowY: 'auto' }}>
      <PageContainer size="md">
        <HStack gap={0} justify="space-between" css={{ marginBottom: '28px' }}>
          <Box>
            <Text css={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--studio-text-primary)', marginBottom: '4px' }}>
              Projects
            </Text>
            <Text css={{ fontSize: '14px', color: 'var(--studio-text-tertiary)' }}>
              Manage your project workspaces.
            </Text>
          </Box>
          <Box
            as="button"
            onClick={() => setShowRegister(true)}
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--studio-border)',
              background: 'var(--studio-bg-surface)',
              color: 'var(--studio-text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              '&:hover': { background: 'var(--studio-bg-hover)', borderColor: 'var(--studio-border-hover)' },
            }}
          >
            <FolderPlus size={14} />
            Add Project
          </Box>
        </HStack>

        {/* Register form */}
        {showRegister && (
          <Box
            css={{
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid var(--studio-border)',
              background: 'var(--studio-bg-sidebar)',
              marginBottom: '20px',
            }}
          >
            <Text css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '12px' }}>
              Register a project
            </Text>
            <VStack gap={3} align="stretch">
              <input
                type="text"
                placeholder="Project path (e.g. /Users/you/my-project)"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--studio-border)',
                  background: 'var(--studio-bg-surface)',
                  color: 'var(--studio-text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                  width: '100%',
                }}
              />
              <input
                type="text"
                placeholder="Display name (optional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--studio-border)',
                  background: 'var(--studio-bg-surface)',
                  color: 'var(--studio-text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                  width: '100%',
                }}
              />
              <HStack gap={2}>
                <Box
                  as="button"
                  onClick={handleRegister}
                  css={{
                    padding: '7px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--studio-accent)',
                    color: 'var(--studio-accent-fg)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.9 },
                  }}
                >
                  Register
                </Box>
                <Box
                  as="button"
                  onClick={() => { setShowRegister(false); setNewPath(''); setNewName('') }}
                  css={{
                    padding: '7px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--studio-text-tertiary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    '&:hover': { color: 'var(--studio-text-secondary)' },
                  }}
                >
                  Cancel
                </Box>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Project list */}
        {projects.length === 0 && !showRegister ? (
          <EmptyState
            icon={<FolderOpen size={40} />}
            title="No projects yet"
            description="Add a project folder to get started."
          />
        ) : (
          <VStack
            gap={0}
            align="stretch"
            css={{
              borderRadius: '10px',
              border: '1px solid var(--studio-border)',
              overflow: 'hidden',
              background: 'var(--studio-bg-sidebar)',
            }}
          >
            {projects.map((project: Project) => {
              const isActive = project.id === activeProject?.id
              return (
                <Box
                  key={project.id}
                  as="button"
                  onClick={() => activate(project.id)}
                  css={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    border: 'none',
                    borderBottom: '1px solid var(--studio-border)',
                    background: isActive ? 'var(--studio-bg-hover)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.1s ease',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { background: 'var(--studio-bg-hover)', '& .proj-del': { opacity: 1 } },
                  }}
                >
                  <FolderOpen size={16} style={{ color: 'var(--studio-text-tertiary)', flexShrink: 0 }} />
                  <Box css={{ flex: 1, minWidth: 0 }}>
                    <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>
                      {project.name}
                    </Text>
                    <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {project.path}
                    </Text>
                  </Box>
                  {isActive && <Check size={14} style={{ color: 'var(--studio-green)', flexShrink: 0 }} />}
                  <Tooltip content="Remove from Studio">
                    <Box
                      as="span"
                      className="proj-del"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); remove(project.id) }}
                      css={{
                        opacity: 0,
                        width: '26px',
                        height: '26px',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--studio-text-muted)',
                        transition: 'all 0.1s ease',
                        flexShrink: 0,
                        '&:hover': { color: 'var(--studio-error)', background: 'rgba(239,68,68,0.1)' },
                      }}
                    >
                      <Trash2 size={13} />
                    </Box>
                  </Tooltip>
                </Box>
              )
            })}
          </VStack>
        )}
      </PageContainer>
    </Box>
  )
}
