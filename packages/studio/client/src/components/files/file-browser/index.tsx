import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { FileViewer } from '../file-viewer/index'
import { useFiles } from '@/hooks/use-files'
import { useFileStore } from '@/stores/file-store'
import { ExplorerPanel } from './explorer-panel'
import { EmptyViewer } from './empty-viewer'

export function FileBrowser() {
  const { tree, fetchFileTree, fetchFileContent } = useFiles()
  const { activeTab, openTabs, changedFiles } = useFileStore()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <Box css={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* Explorer panel */}
      <ExplorerPanel
        tree={tree}
        activeTab={activeTab}
        changedFiles={changedFiles}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={() => fetchFileTree()}
        onSelectFile={fetchFileContent}
      />

      {/* Viewer panel */}
      <Box css={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {openTabs.length > 0 && activeTab ? (
          <FileViewer />
        ) : (
          <EmptyViewer />
        )}
      </Box>
    </Box>
  )
}
