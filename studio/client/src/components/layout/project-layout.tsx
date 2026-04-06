import { useEffect } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import { useProjects } from '@/hooks/use-projects'
import { useProjectStore } from '@/stores/project-store'
import { resetProjectStores } from '@/stores/reset'

/**
 * Wrapper layout for project-scoped routes.
 * Reads :projectId from URL and activates that project.
 * Resets all project-scoped stores when switching projects.
 */
export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  const { activate } = useProjects()
  const activeProject = useProjectStore((s) => s.activeProject)
  const navigate = useNavigate()

  useEffect(() => {
    if (projectId && projectId !== activeProject?.id) {
      resetProjectStores()
      activate(projectId).catch(() => {
        navigate('/', { replace: true })
      })
    }
  }, [projectId, activeProject?.id, activate, navigate])

  return <Outlet />
}
