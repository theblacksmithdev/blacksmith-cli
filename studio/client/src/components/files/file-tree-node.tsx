import { HStack, Text, Box, IconButton } from '@chakra-ui/react'
import { File, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { FileNode } from '@/types'

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
      <HStack
        gap={1}
        pl={`${depth * 16 + 4}px`}
        pr={2}
        py={0.5}
        cursor="pointer"
        bg={isSelected ? 'blue.900' : 'transparent'}
        _hover={{ bg: isSelected ? 'blue.900' : 'gray.700' }}
        borderRadius="sm"
        onClick={() => {
          if (isDir) setExpanded(!expanded)
          else onSelectFile(node.path)
        }}
      >
        {isDir ? (
          <>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {expanded ? <FolderOpen size={14} /> : <Folder size={14} />}
          </>
        ) : (
          <>
            <Box w="12px" />
            <File size={14} />
          </>
        )}
        <Text fontSize="xs" lineClamp={1} flex={1}>{node.name}</Text>
        {isChanged && (
          <Box w="6px" h="6px" borderRadius="full" bg="orange.400" flexShrink={0} />
        )}
      </HStack>

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
