import { Box, Text } from '@chakra-ui/react'
import { File, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { FileNode } from '@/types'

const extColorMap: Record<string, string> = {
  ts: '#10b981',
  tsx: '#10a37f',
  js: '#f59e0b',
  jsx: '#f59e0b',
  py: '#3b82f6',
  json: '#b4b4b4',
  css: '#e879f9',
  scss: '#e879f9',
  html: '#ef4444',
  md: '#b4b4b4',
  yml: '#b4b4b4',
  yaml: '#b4b4b4',
  hbs: '#f97316',
}

function getFileColor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return extColorMap[ext] || '#8e8e8e'
}

interface FileTreeNodeProps {
  node: FileNode
  depth: number
  selectedFile: string | null
  changedFiles: Set<string>
  onSelectFile: (path: string) => void
  searchQuery?: string
}

export function FileTreeNode({ node, depth, selectedFile, changedFiles, onSelectFile, searchQuery = '' }: FileTreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 1 || (!!searchQuery && depth < 4))
  const isDir = node.type === 'directory'
  const isSelected = node.path === selectedFile
  const isChanged = changedFiles.has(node.path)

  // Filter children when searching
  const visibleChildren = isDir && node.children
    ? searchQuery
      ? node.children.filter((child) => {
          const q = searchQuery.toLowerCase()
          if (child.name.toLowerCase().includes(q)) return true
          if (child.type === 'directory' && child.children) {
            return child.children.some(function match(n: FileNode): boolean {
              if (n.name.toLowerCase().includes(q)) return true
              return n.children?.some(match) ?? false
            })
          }
          return false
        })
      : node.children
    : []

  // Auto-expand when searching
  const isExpanded = searchQuery ? true : expanded

  return (
    <Box>
      <Box
        as="button"
        onClick={() => {
          if (isDir) setExpanded(!expanded)
          else onSelectFile(node.path)
        }}
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          width: '100%',
          height: '28px',
          paddingLeft: `${depth * 14 + 10}px`,
          paddingRight: '10px',
          cursor: 'pointer',
          background: isSelected ? 'var(--studio-bg-hover)' : 'transparent',
          transition: 'background 0.1s ease',
          border: 'none',
          borderLeft: isSelected ? '2px solid var(--studio-text-primary)' : '2px solid transparent',
          textAlign: 'left',
          '&:hover': {
            background: isSelected ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)',
          },
        }}
      >
        {isDir ? (
          <>
            <Box css={{ color: 'var(--studio-text-muted)', flexShrink: 0, display: 'flex', width: '14px', justifyContent: 'center' }}>
              {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </Box>
            <Box css={{ color: '#f59e0b', flexShrink: 0, display: 'flex' }}>
              {isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}
            </Box>
          </>
        ) : (
          <>
            <Box css={{ width: '14px', flexShrink: 0 }} />
            <Box css={{ color: getFileColor(node.name), flexShrink: 0, display: 'flex' }}>
              <File size={14} />
            </Box>
          </>
        )}

        <Text
          css={{
            fontSize: '12px',
            color: isSelected ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            marginLeft: '4px',
            fontWeight: isSelected ? 500 : 400,
          }}
        >
          {node.name}
        </Text>

        {isChanged && (
          <Box css={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--studio-warning)', flexShrink: 0 }} />
        )}
      </Box>

      {isDir && isExpanded && visibleChildren.map((child) => (
        <FileTreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          selectedFile={selectedFile}
          changedFiles={changedFiles}
          onSelectFile={onSelectFile}
          searchQuery={searchQuery}
        />
      ))}
    </Box>
  )
}
