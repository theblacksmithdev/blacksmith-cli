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
        border: '1px solid var(--studio-border)',
        overflow: 'hidden',
        marginBottom: '12px',
        background: 'var(--studio-code-bg)',
      }}
    >
      {/* Header bar */}
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          borderBottom: '1px solid var(--studio-border)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <Text
          css={{
            fontSize: '11px',
            color: 'var(--studio-text-tertiary)',
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
            color: copied ? 'var(--studio-green)' : 'var(--studio-text-tertiary)',
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              color: 'var(--studio-text-secondary)',
              background: 'var(--studio-border)',
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
    <Box className="markdown-body" css={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--studio-text-primary)' }}>
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
                color: 'var(--studio-text-primary)',
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
                color: 'var(--studio-text-primary)',
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
                color: 'var(--studio-text-primary)',
              }}
            >
              {children}
            </Heading>
          ),
          p: ({ children }) => (
            <Text css={{ marginBottom: '10px', color: 'var(--studio-text-primary)', lineHeight: '1.7' }}>
              {children}
            </Text>
          ),
          a: ({ href, children }) => (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              css={{
                color: 'var(--studio-link)',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(122,184,245,0.3)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderBottomColor: 'var(--studio-link)',
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
                    background: 'var(--studio-bg-surface)',
                    color: '#e879f9',
                    fontSize: '0.9em',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid var(--studio-border)',
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
                borderLeft: '3px solid var(--studio-border-hover)',
                paddingLeft: '16px',
                margin: '12px 0',
                color: 'var(--studio-text-secondary)',
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
                  color: 'var(--studio-text-primary)',
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
                  color: 'var(--studio-text-primary)',
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
