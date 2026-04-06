import { Box } from '@chakra-ui/react'
import { FileTreeNode } from './file-tree-node'
import type { FileNode } from '@/types'

interface FileTreeProps {
  tree: FileNode
  selectedFile: string | null
  changedFiles: Set<string>
  onSelectFile: (path: string) => void
  searchQuery?: string
}

function matchesSearch(node: FileNode, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  if (node.name.toLowerCase().includes(q)) return true
  if (node.children) {
    return node.children.some((child) => matchesSearch(child, q))
  }
  return false
}

export function FileTree({ tree, selectedFile, changedFiles, onSelectFile, searchQuery = '' }: FileTreeProps) {
  const filteredChildren = tree.children?.filter((child) => matchesSearch(child, searchQuery))

  return (
    <Box css={{ paddingTop: '2px' }}>
      {filteredChildren?.map((child) => (
        <FileTreeNode
          key={child.path}
          node={child}
          depth={0}
          selectedFile={selectedFile}
          changedFiles={changedFiles}
          onSelectFile={onSelectFile}
          searchQuery={searchQuery}
        />
      ))}
    </Box>
  )
}
