import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { Anvil, FolderPlus, ArrowRight } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { ProjectCard } from '@/components/dashboard/project-card'
import { useProjects } from '@/hooks/use-projects'
import { useSessions } from '@/hooks/use-sessions'
import { useProjectStore } from '@/stores/project-store'
import { Path, chatPath, activityPath, projectHome } from '@/router/paths'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { projects, activate } = useProjects()
  const { sessions } = useSessions()
  const activeProject = useProjectStore((s) => s.activeProject)

  const recentSessions = sessions.slice(0, 5)

  return (
    <Box css={{ height: '100%', overflowY: 'auto' }}>
      <PageContainer size="lg">
        {/* Hero */}
        <VStack gap={3} css={{ paddingTop: '40px', paddingBottom: '36px' }}>
          <Box
            css={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'var(--studio-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Anvil size={22} color="var(--studio-accent-fg)" />
          </Box>
          <Text css={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--studio-text-primary)', textAlign: 'center' }}>
            Welcome to Blacksmith Studio
          </Text>
          <Text css={{ fontSize: '14px', color: 'var(--studio-text-tertiary)', textAlign: 'center' }}>
            {activeProject
              ? `Working on ${activeProject.name}`
              : 'Select a project or add one to get started.'}
          </Text>
        </VStack>

        {/* Recent sessions */}
        {activeProject && recentSessions.length > 0 && (
          <Box css={{ marginBottom: '40px' }}>
            <HStack gap={0} justify="space-between" css={{ marginBottom: '12px' }}>
              <Text css={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--studio-text-muted)' }}>
                Recent conversations
              </Text>
              <Box
                as="button"
                onClick={() => navigate(activityPath(activeProject.id))}
                css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', '&:hover': { color: 'var(--studio-text-secondary)' } }}
              >
                View all <ArrowRight size={12} />
              </Box>
            </HStack>
            <VStack gap={1} align="stretch">
              {recentSessions.map((session) => (
                <Box
                  key={session.id}
                  as="button"
                  onClick={() => navigate(chatPath(activeProject.id, session.id))}
                  css={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                    borderRadius: '8px', border: 'none', background: 'var(--studio-bg-sidebar)',
                    color: 'var(--studio-text-secondary)', fontSize: '13px', cursor: 'pointer',
                    textAlign: 'left', width: '100%', transition: 'all 0.1s ease',
                    '&:hover': { background: 'var(--studio-bg-hover)', color: 'var(--studio-text-primary)' },
                  }}
                >
                  <Text css={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session.lastPrompt || session.name}
                  </Text>
                  <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', flexShrink: 0 }}>
                    {session.messageCount} msgs
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Projects */}
        <Box css={{ marginBottom: '40px' }}>
          <HStack gap={0} justify="space-between" css={{ marginBottom: '12px' }}>
            <Text css={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--studio-text-muted)' }}>
              Projects
            </Text>
            <Box
              as="button"
              onClick={() => navigate(Path.AddProject)}
              css={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '6px',
                border: '1px solid var(--studio-border)', background: 'var(--studio-bg-surface)',
                color: 'var(--studio-text-secondary)', fontSize: '12px', cursor: 'pointer',
                transition: 'all 0.12s ease',
                '&:hover': { background: 'var(--studio-bg-hover)', borderColor: 'var(--studio-border-hover)' },
              }}
            >
              <FolderPlus size={12} /> Add project
            </Box>
          </HStack>

          {projects.length === 0 ? (
            <Box
              as="button"
              onClick={() => navigate(Path.AddProject)}
              css={{
                width: '100%',
                padding: '40px 20px',
                borderRadius: '10px',
                border: '1px dashed var(--studio-border)',
                textAlign: 'center',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                '&:hover': { borderColor: 'var(--studio-border-hover)', background: 'var(--studio-bg-sidebar)' },
              }}
            >
              <FolderPlus size={24} style={{ margin: '0 auto 8px', color: 'var(--studio-text-muted)' }} />
              <Text css={{ fontSize: '14px', color: 'var(--studio-text-secondary)', marginBottom: '4px' }}>No projects yet</Text>
              <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)' }}>Click to add your first project</Text>
            </Box>
          ) : (
            <VStack gap={2} align="stretch">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isActive={project.id === activeProject?.id}
                  onSelect={async () => { await activate(project.id); navigate(projectHome(project.id)) }}
                />
              ))}
            </VStack>
          )}
        </Box>
      </PageContainer>
    </Box>
  )
}
