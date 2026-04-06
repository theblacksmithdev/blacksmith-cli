import { useState } from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { ChevronDown, FolderOpen, Check } from 'lucide-react'
import { useProjects } from '@/hooks/use-projects'
import { useProjectStore, type Project } from '@/stores/project-store'

export function ProjectSwitcher() {
  const [open, setOpen] = useState(false)
  const { projects, activate } = useProjects()
  const activeProject = useProjectStore((s) => s.activeProject)

  const handleSelect = async (project: Project) => {
    await activate(project.id)
    setOpen(false)
  }

  return (
    <Box css={{ position: 'relative' }}>
      {/* Trigger */}
      <Box
        as="button"
        onClick={() => setOpen(!open)}
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          borderRadius: '7px',
          border: 'none',
          background: 'transparent',
          color: 'var(--studio-text-secondary)',
          fontSize: '11px',
          cursor: 'pointer',
          transition: 'all 0.12s ease',
          width: '100%',
          textAlign: 'left',
          overflow: 'hidden',
          '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-primary)' },
        }}
      >
        <FolderOpen size={13} style={{ flexShrink: 0 }} />
        <Text css={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11px' }}>
          {activeProject?.name || 'No project'}
        </Text>
        <ChevronDown size={12} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </Box>

      {/* Dropdown */}
      {open && (
        <>
          <Box
            css={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <Box
            css={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              width: '220px',
              background: 'var(--studio-bg-surface)',
              border: '1px solid var(--studio-border)',
              borderRadius: '8px',
              boxShadow: 'var(--studio-shadow)',
              zIndex: 100,
              overflow: 'hidden',
              padding: '4px',
            }}
          >
            <Text
              css={{
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--studio-text-muted)',
                padding: '6px 8px 4px',
              }}
            >
              Projects
            </Text>
            <VStack gap={0} align="stretch">
              {projects.length === 0 && (
                <Text css={{ padding: '8px', fontSize: '12px', color: 'var(--studio-text-muted)' }}>
                  No projects yet
                </Text>
              )}
              {projects.map((project) => {
                const isActive = project.id === activeProject?.id
                return (
                  <Box
                    key={project.id}
                    as="button"
                    onClick={() => handleSelect(project)}
                    css={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 8px',
                      borderRadius: '5px',
                      border: 'none',
                      background: isActive ? 'var(--studio-bg-hover)' : 'transparent',
                      color: 'var(--studio-text-primary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 0.1s ease',
                      '&:hover': { background: 'var(--studio-bg-hover)' },
                    }}
                  >
                    <Text css={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {project.name}
                    </Text>
                    {isActive && <Check size={13} style={{ color: 'var(--studio-green)', flexShrink: 0 }} />}
                  </Box>
                )
              })}
            </VStack>
          </Box>
        </>
      )}
    </Box>
  )
}
