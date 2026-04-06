import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Box, Code, Text, Heading, Link } from '@chakra-ui/react'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <Box className="markdown-body" fontSize="sm" lineHeight="tall">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => <Heading as="h1" size="lg" mt={4} mb={2}>{children}</Heading>,
          h2: ({ children }) => <Heading as="h2" size="md" mt={3} mb={2}>{children}</Heading>,
          h3: ({ children }) => <Heading as="h3" size="sm" mt={2} mb={1}>{children}</Heading>,
          p: ({ children }) => <Text mb={2}>{children}</Text>,
          a: ({ href, children }) => <Link href={href} color="blue.400" target="_blank" rel="noopener noreferrer">{children}</Link>,
          code: ({ className, children, ...props }) => {
            const isInline = !className
            if (isInline) {
              return <Code colorPalette="gray" fontSize="sm" px={1}>{children}</Code>
            }
            return (
              <Box
                as="pre"
                bg="gray.900"
                p={3}
                borderRadius="md"
                overflowX="auto"
                mb={3}
                fontSize="xs"
              >
                <code className={className} {...props}>{children}</code>
              </Box>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  )
}
