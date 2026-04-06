import { useRef, useCallback } from 'react'
import { Box, Text } from '@chakra-ui/react'
import Editor, { type OnMount } from '@monaco-editor/react'
import { useThemeMode } from '@/hooks/use-theme-mode'
import { getMonacoLanguage } from './language-map'

interface CodeEditorProps {
  content: string
  language: string
}

const BASE_OPTIONS = {
  readOnly: true,
  fontSize: 13,
  fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, Consolas, monospace",
  lineHeight: 20,
  padding: { top: 12, bottom: 12 },
  scrollBeyondLastLine: true,
  smoothScrolling: true,
  cursorBlinking: 'solid' as const,
  renderLineHighlight: 'all' as const,
  bracketPairColorization: { enabled: true },
  folding: true,
  glyphMargin: false,
  lineNumbersMinChars: 4,
  overviewRulerBorder: false,
  minimap: { enabled: false },
  scrollbar: {
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
    useShadows: false,
  },
}

export function CodeEditor({ content, language }: CodeEditorProps) {
  const { mode } = useThemeMode()
  const monacoLang = getMonacoLanguage(language)
  const editorRef = useRef<any>(null)

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor
  }, [])

  return (
    <Box css={{ flex: 1, position: 'relative', minHeight: 0 }}>
      <Box css={{ position: 'absolute', inset: 0 }}>
        <Editor
          height="100%"
          width="100%"
          language={monacoLang}
          value={content}
          theme={mode === 'dark' ? 'vs-dark' : 'light'}
          options={BASE_OPTIONS}
          onMount={handleMount}
          keepCurrentModel={false}
          loading={
            <Box css={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Text css={{ fontSize: '13px', color: 'var(--studio-text-muted)' }}>Loading editor...</Text>
            </Box>
          }
        />
      </Box>
    </Box>
  )
}
