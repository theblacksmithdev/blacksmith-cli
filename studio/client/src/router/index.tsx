import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/components/layout/root-layout'
import { Path } from './paths'

import ChatPage from '@/pages/chat'
import TemplatesPage from '@/pages/templates'
import FilesPage from '@/pages/files'
import ActivityPage from '@/pages/activity'
import SettingsPage from '@/pages/settings'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: Path.Chat, element: <ChatPage /> },
      { path: Path.Templates, element: <TemplatesPage /> },
      { path: Path.Files, element: <FilesPage /> },
      { path: Path.Activity, element: <ActivityPage /> },
      { path: Path.Settings, element: <SettingsPage /> },
    ],
  },
])
