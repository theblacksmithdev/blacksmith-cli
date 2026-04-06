import { createBrowserRouter, Navigate } from 'react-router-dom'
import { StudioLayout } from '@/components/layout/studio-layout'
import { ProjectLayout } from '@/components/layout/project-layout'
import { Path } from './paths'

import DashboardPage from '@/pages/dashboard'
import ProjectsPage from '@/pages/projects'
import AddProjectPage from '@/pages/projects/add'
import SettingsPage from '@/pages/settings'
import NewChatPage from '@/pages/chat/new'
import ChatPage from '@/pages/chat'
import FilesPage from '@/pages/files'
import RunPage from '@/pages/run'
import TemplatesPage from '@/pages/templates'
import ActivityPage from '@/pages/activity'

export const router = createBrowserRouter([
  // Full-screen routes (no nav rail)
  { path: Path.AddProject, element: <AddProjectPage /> },

  // Studio layout
  {
    element: <StudioLayout />,
    children: [
      // Global routes
      { path: Path.Home, element: <DashboardPage /> },
      { path: Path.Projects, element: <ProjectsPage /> },

      // Project-scoped routes
      {
        path: '/:projectId',
        element: <ProjectLayout />,
        children: [
          // Default: redirect /:projectId → /:projectId/chat/new
          { index: true, element: <NewChatPage /> },
          { path: 'chat/new', element: <NewChatPage /> },
          { path: 'chat/:sessionId', element: <ChatPage /> },
          { path: 'code', element: <FilesPage /> },
          { path: 'run', element: <RunPage /> },
          { path: 'templates', element: <TemplatesPage /> },
          { path: 'activity', element: <ActivityPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
])
