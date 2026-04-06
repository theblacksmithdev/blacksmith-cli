import { useEffect } from 'react'
import { Box, Text, IconButton } from '@chakra-ui/react'
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
      {/* Header bar */}
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(12,12,14,0.6)',
        }}
      >
        <Text
          css={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#e8e8ed',
            letterSpacing: '-0.01em',
            flex: 1,
          }}
        >
          Files
        </Text>
        <Tooltip content="Refresh">
          <IconButton
            aria-label="Refresh files"
            size="xs"
            variant="ghost"
            onClick={() => fetchFileTree()}
            css={{
              color: '#55555f',
              borderRadius: '6px',
              '&:hover': {
                color: '#85858f',
                background: '#1c1c20',
              },
            }}
          >
            <RefreshCw size={13} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Split pane */}
      <Box
        css={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Tree panel */}
        <Box
          css={{
            width: '260px',
            background: '#0c0c0e',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            overflowY: 'auto',
            flexShrink: 0,
          }}
        >
          {tree && (
            <FileTree
              tree={tree}
              selectedFile={selectedFile}
              changedFiles={changedFiles}
              onSelectFile={fetchFileContent}
            />
          )}
        </Box>

        {/* Viewer panel */}
        <Box
          css={{
            flex: 1,
            background: '#141416',
            minWidth: 0,
          }}
        >
          <FileViewer
            filePath={selectedFile}
            content={fileContent}
            language={fileLanguage}
            isChanged={selectedFile ? changedFiles.has(selectedFile) : false}
          />
        </Box>
      </Box>
    </Box>
  )
}
