export function getEditorOptions(lineCount: number) {
  return {
    readOnly: true,
    minimap: { enabled: lineCount > 100 },
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
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
      useShadows: false,
    },
  }
}
