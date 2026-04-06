import { Box } from '@chakra-ui/react'
import { FileTreeNode } from './file-tree-node'
import type { FileNode } from '@/types'

interface FileTreeProps {
  tree: FileNode
  selectedFile: string | null
  changedFiles: Set<string>
  onSelectFile: (path: string) => void
}

export function FileTree({ tree, selectedFile, changedFiles, onSelectFile }: FileTreeProps) {
  return (
    <Box overflowY="auto" py={1}>
      {tree.children?.map((child) => (
        <FileTreeNode
          key={child.path}
          node={child}
          depth={0}
          selectedFile={selectedFile}
          changedFiles={changedFiles}
          onSelectFile={onSelectFile}
        />
      ))}
    </Box>
  )
}
