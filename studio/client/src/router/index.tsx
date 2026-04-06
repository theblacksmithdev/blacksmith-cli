import { createBrowserRouter } from 'react-router-dom'
import { StudioLayout } from '@/components/layout/studio-layout'
import { Path } from './paths'

import HomePage from '@/pages/chat/home'
import NewChatPage from '@/pages/chat/new'
import ChatPage from '@/pages/chat'
import FilesPage from '@/pages/files'
import RunPage from '@/pages/run'
import TemplatesPage from '@/pages/templates'
import ActivityPage from '@/pages/activity'
import SettingsPage from '@/pages/settings'

export const router = createBrowserRouter([
  {
    element: <StudioLayout />,
    children: [
      { path: Path.Home, element: <HomePage /> },
      { path: Path.NewChat, element: <NewChatPage /> },
      { path: Path.Chat, element: <ChatPage /> },
      { path: Path.Code, element: <FilesPage /> },
      { path: Path.Run, element: <RunPage /> },
      { path: Path.Templates, element: <TemplatesPage /> },
      { path: Path.Activity, element: <ActivityPage /> },
      { path: Path.Settings, element: <SettingsPage /> },
    ],
  },
])
