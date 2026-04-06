import { Box, Text } from '@chakra-ui/react'
import { File, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { FileNode } from '@/types'

const extColorMap: Record<string, string> = {
  ts: '#10b981',
  tsx: '#6366f1',
  js: '#f59e0b',
  jsx: '#f59e0b',
  py: '#3b82f6',
  json: '#8888a0',
  css: '#e879f9',
  scss: '#e879f9',
  html: '#ef4444',
  md: '#8888a0',
  yml: '#8888a0',
  yaml: '#8888a0',
}

function getFileColor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return extColorMap[ext] || '#555568'
}

interface FileTreeNodeProps {
  node: FileNode
  depth: number
  selectedFile: string | null
  changedFiles: Set<string>
  onSelectFile: (path: string) => void
}

export function FileTreeNode({ node, depth, selectedFile, changedFiles, onSelectFile }: FileTreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2)
  const isDir = node.type === 'directory'
  const isSelected = node.path === selectedFile
  const isChanged = changedFiles.has(node.path)

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
          gap: '4px',
          width: '100%',
          paddingLeft: `${depth * 16 + 8}px`,
          paddingRight: '8px',
          paddingTop: '3px',
          paddingBottom: '3px',
          cursor: 'pointer',
          background: isSelected ? 'rgba(99,102,241,0.08)' : 'transparent',
          borderLeft: isSelected ? '2px solid #6366f1' : '2px solid transparent',
          transition: 'all 0.15s ease',
          border: 'none',
          borderLeftStyle: 'solid',
          borderLeftWidth: '2px',
          borderLeftColor: isSelected ? '#6366f1' : 'transparent',
          position: 'relative',
          textAlign: 'left',
          '&:hover': {
            background: isSelected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
          },
        }}
      >
        {/* Indent guide lines */}
        {depth > 0 && Array.from({ length: depth }).map((_, i) => (
          <Box
            key={i}
            css={{
              position: 'absolute',
              left: `${i * 16 + 14}px`,
              top: 0,
              bottom: 0,
              width: '1px',
              background: 'rgba(255,255,255,0.04)',
            }}
          />
        ))}

        {isDir ? (
          <>
            <Box css={{ color: '#555568', flexShrink: 0, display: 'flex' }}>
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </Box>
            <Box css={{ color: '#f59e0b', flexShrink: 0, display: 'flex' }}>
              {expanded ? <FolderOpen size={14} /> : <Folder size={14} />}
            </Box>
          </>
        ) : (
          <>
            <Box css={{ width: '12px', flexShrink: 0 }} />
            <Box css={{ color: getFileColor(node.name), flexShrink: 0, display: 'flex' }}>
              <File size={14} />
            </Box>
          </>
        )}

        <Text
          css={{
            fontSize: '12px',
            color: isSelected ? '#f0f0f5' : '#8888a0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            lineHeight: '20px',
          }}
        >
          {node.name}
        </Text>

        {isChanged && (
          <Box
            css={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#f59e0b',
              flexShrink: 0,
            }}
          />
        )}
      </Box>

      {isDir && expanded && node.children?.map((child) => (
        <FileTreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          selectedFile={selectedFile}
          changedFiles={changedFiles}
          onSelectFile={onSelectFile}
        />
      ))}
    </Box>
  )
}
