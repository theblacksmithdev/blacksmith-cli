import { useMemo } from 'react'
import { Box, Text } from '@chakra-ui/react'
import Editor from '@monaco-editor/react'
import { useThemeMode } from '@/hooks/use-theme-mode'
import { getMonacoLanguage } from './language-map'
import { getEditorOptions } from './editor-options'

interface CodeEditorProps {
  content: string
  language: string
}

export function CodeEditor({ content, language }: CodeEditorProps) {
  const { mode } = useThemeMode()
  const lineCount = content.split('\n').length
  const monacoLang = getMonacoLanguage(language)
  const options = useMemo(() => getEditorOptions(lineCount), [lineCount])

  return (
    <Box css={{ flex: 1, overflow: 'hidden' }}>
      <Editor
        height="100%"
        language={monacoLang}
        value={content}
        theme={mode === 'dark' ? 'vs-dark' : 'light'}
        options={options}
        loading={
          <Box css={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Text css={{ fontSize: '13px', color: 'var(--studio-text-muted)' }}>Loading editor...</Text>
          </Box>
        }
      />
    </Box>
  )
}
