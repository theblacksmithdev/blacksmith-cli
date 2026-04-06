import {
  Sparkles,
  FolderTree,
  History,
  Play,
  Settings,
} from 'lucide-react'
import { Path } from '@/router/paths'

export const navItems = [
  { path: Path.Templates, icon: Sparkles, label: 'Templates' },
  { path: Path.Code, icon: FolderTree, label: 'Code' },
  { path: Path.Run, icon: Play, label: 'Run' },
  { path: Path.Activity, icon: History, label: 'Activity' },
  { path: Path.Settings, icon: Settings, label: 'Settings' },
] as const
