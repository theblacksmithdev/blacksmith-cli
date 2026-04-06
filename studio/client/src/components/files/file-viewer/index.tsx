import { Box, Text } from '@chakra-ui/react'
import { TabBar } from './tab-bar'
import { CodeEditor } from './code-editor'
import { StatusBar } from './status-bar'

interface FileViewerProps {
  filePath: string
  content: string | null
  language: string
  isChanged: boolean
}

export function FileViewer({ filePath, content, language, isChanged }: FileViewerProps) {
  const lineCount = (content || '').split('\n').length

  return (
    <Box css={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--studio-bg-main)' }}>
      <TabBar
        filePath={filePath}
        language={language}
        isChanged={isChanged}
        content={content}
      />

      {content !== null ? (
        <CodeEditor content={content} language={language} />
      ) : (
        <Box css={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text css={{ fontSize: '13px', color: 'var(--studio-text-muted)' }}>Loading...</Text>
        </Box>
      )}

      <StatusBar
        lineCount={lineCount}
        language={language}
        isChanged={isChanged}
      />
    </Box>
  )
}
