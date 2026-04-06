import { Box, Text } from '@chakra-ui/react'
import { TabBar } from './tab-bar'
import { CodeEditor } from './code-editor'
import { StatusBar } from './status-bar'
import { useFileStore } from '@/stores/file-store'

export function FileViewer() {
  const { openTabs, activeTab, changedFiles } = useFileStore()

  const currentTab = openTabs.find((t) => t.path === activeTab)

  if (!currentTab || !activeTab) {
    return null
  }

  const lineCount = (currentTab.content || '').split('\n').length
  const isChanged = changedFiles.has(activeTab)

  return (
    <Box css={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--studio-bg-main)' }}>
      <TabBar
        activeFilePath={activeTab}
        language={currentTab.language}
        content={currentTab.content}
      />

      {currentTab.content !== null ? (
        <CodeEditor content={currentTab.content} language={currentTab.language} />
      ) : (
        <Box css={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text css={{ fontSize: '13px', color: 'var(--studio-text-muted)' }}>Loading...</Text>
        </Box>
      )}

      <StatusBar
        lineCount={lineCount}
        language={currentTab.language}
        isChanged={isChanged}
      />
    </Box>
  )
}
