import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Box, Code, Text, Heading, Link } from '@chakra-ui/react'
import { Copy, Check } from 'lucide-react'

interface MarkdownRendererProps {
  content: string
}

function CodeBlock({ className, children }: { className?: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const language = className?.replace('language-', '') || ''
  const code = String(children).replace(/\n$/, '')

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Box
      css={{
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        marginBottom: '12px',
        background: '#171717',
      }}
    >
      {/* Header bar */}
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <Text
          css={{
            fontSize: '11px',
            color: '#8e8e8e',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontWeight: 500,
          }}
        >
          {language || 'code'}
        </Text>
        <Box
          as="button"
          onClick={handleCopy}
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'transparent',
            border: 'none',
            color: copied ? '#10a37f' : '#8e8e8e',
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              color: '#b4b4b4',
              background: 'rgba(255,255,255,0.04)',
            },
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </Box>
      </Box>

      {/* Code content */}
      <Box
        as="pre"
        css={{
          padding: '12px 16px',
          overflowX: 'auto',
          margin: 0,
          fontSize: '13px',
          lineHeight: '20px',
          fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
        }}
      >
        <code className={className}>{children}</code>
      </Box>
    </Box>
  )
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <Box className="markdown-body" css={{ fontSize: '14px', lineHeight: '1.7', color: '#ececec' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <Heading
              as="h1"
              css={{
                fontSize: '22px',
                fontWeight: 600,
                marginTop: '20px',
                marginBottom: '10px',
                letterSpacing: '-0.02em',
                color: '#ececec',
              }}
            >
              {children}
            </Heading>
          ),
          h2: ({ children }) => (
            <Heading
              as="h2"
              css={{
                fontSize: '18px',
                fontWeight: 600,
                marginTop: '16px',
                marginBottom: '8px',
                letterSpacing: '-0.02em',
                color: '#ececec',
              }}
            >
              {children}
            </Heading>
          ),
          h3: ({ children }) => (
            <Heading
              as="h3"
              css={{
                fontSize: '15px',
                fontWeight: 600,
                marginTop: '12px',
                marginBottom: '6px',
                letterSpacing: '-0.01em',
                color: '#ececec',
              }}
            >
              {children}
            </Heading>
          ),
          p: ({ children }) => (
            <Text css={{ marginBottom: '10px', color: '#ececec', lineHeight: '1.7' }}>
              {children}
            </Text>
          ),
          a: ({ href, children }) => (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              css={{
                color: '#7ab8f5',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(122,184,245,0.3)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderBottomColor: '#7ab8f5',
                },
              }}
            >
              {children}
            </Link>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className
            if (isInline) {
              return (
                <Code
                  css={{
                    background: '#2f2f2f',
                    color: '#e879f9',
                    fontSize: '0.9em',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
                  }}
                >
                  {children}
                </Code>
              )
            }
            return <CodeBlock className={className}>{children}</CodeBlock>
          },
          blockquote: ({ children }) => (
            <Box
              as="blockquote"
              css={{
                borderLeft: '3px solid rgba(255,255,255,0.12)',
                paddingLeft: '16px',
                margin: '12px 0',
                color: '#b4b4b4',
                fontStyle: 'italic',
              }}
            >
              {children}
            </Box>
          ),
          ul: ({ children }) => (
            <Box
              as="ul"
              css={{
                paddingLeft: '20px',
                marginBottom: '10px',
                listStyleType: 'disc',
                '& li': {
                  marginBottom: '4px',
                  color: '#ececec',
                },
              }}
            >
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box
              as="ol"
              css={{
                paddingLeft: '20px',
                marginBottom: '10px',
                listStyleType: 'decimal',
                '& li': {
                  marginBottom: '4px',
                  color: '#ececec',
                },
              }}
            >
              {children}
            </Box>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  )
}
