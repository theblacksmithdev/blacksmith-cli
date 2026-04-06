import { useEffect } from 'react'
import { Box, HStack, Heading, IconButton } from '@chakra-ui/react'
import { RefreshCw } from 'lucide-react'
import { FileTree } from './file-tree'
import { FileViewer } from './file-viewer'
import { useFiles } from '@/hooks/use-files'
import { useFileStore } from '@/stores/file-store'
import { Tooltip } from '@/components/shared/tooltip'

export function FileBrowser() {
  const { fetchFileTree, fetchFileContent } = useFiles()
  const { tree, selectedFile, fileContent, fileLanguage, changedFiles } = useFileStore()

  useEffect(() => {
    fetchFileTree()
  }, [fetchFileTree])

  return (
    <Box h="full" display="flex" flexDir="column">
      <HStack px={4} py={2} borderBottom="1px solid" borderColor="gray.700">
        <Heading size="sm" flex={1}>Files</Heading>
        <Tooltip content="Refresh">
          <IconButton
            aria-label="Refresh files"
            size="xs"
            variant="ghost"
            onClick={() => fetchFileTree()}
          >
            <RefreshCw size={14} />
          </IconButton>
        </Tooltip>
      </HStack>
      <HStack flex={1} align="stretch" gap={0} overflow="hidden">
        <Box w="280px" borderRight="1px solid" borderColor="gray.700" overflowY="auto">
          {tree && (
            <FileTree
              tree={tree}
              selectedFile={selectedFile}
              changedFiles={changedFiles}
              onSelectFile={fetchFileContent}
            />
          )}
        </Box>
        <Box flex={1}>
          <FileViewer
            filePath={selectedFile}
            content={fileContent}
            language={fileLanguage}
            isChanged={selectedFile ? changedFiles.has(selectedFile) : false}
          />
        </Box>
      </HStack>
    </Box>
  )
}
