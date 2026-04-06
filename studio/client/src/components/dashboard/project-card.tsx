import { Box, Text, HStack } from '@chakra-ui/react'
import { FolderOpen, Check, ArrowRight } from 'lucide-react'
import type { Project } from '@/stores/project-store'
import { formatDate } from '@/lib/format'

interface ProjectCardProps {
  project: Project
  isActive: boolean
  onSelect: () => void
}

export function ProjectCard({ project, isActive, onSelect }: ProjectCardProps) {
  return (
    <Box
      as="button"
      onClick={onSelect}
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '16px',
        borderRadius: '10px',
        border: '1px solid',
        borderColor: isActive ? 'var(--studio-green)' : 'var(--studio-border)',
        background: isActive ? 'var(--studio-bg-hover)' : 'var(--studio-bg-sidebar)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.12s ease',
        '&:hover': {
          borderColor: 'var(--studio-border-hover)',
          background: 'var(--studio-bg-hover)',
          '& .card-arrow': { opacity: 1, transform: 'translateX(0)' },
        },
      }}
    >
      <Box
        css={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: isActive ? 'var(--studio-green-subtle, rgba(16,163,127,0.1))' : 'var(--studio-bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isActive ? 'var(--studio-green)' : 'var(--studio-text-tertiary)',
          flexShrink: 0,
        }}
      >
        <FolderOpen size={18} />
      </Box>
      <Box css={{ flex: 1, minWidth: 0 }}>
        <HStack gap={2}>
          <Text css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>
            {project.name}
          </Text>
          {isActive && <Check size={13} style={{ color: 'var(--studio-green)' }} />}
        </HStack>
        <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
          {project.path}
        </Text>
        <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', marginTop: '4px' }}>
          Opened {formatDate(project.lastOpenedAt)}
        </Text>
      </Box>
      <Box
        className="card-arrow"
        css={{
          opacity: 0,
          transform: 'translateX(-4px)',
          transition: 'all 0.12s ease',
          color: 'var(--studio-text-muted)',
        }}
      >
        <ArrowRight size={16} />
      </Box>
    </Box>
  )
}
