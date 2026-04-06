import { Box, Text } from '@chakra-ui/react'
import {
  Layout, Database, Zap, Bug, Component, RefreshCw, TestTube, Sparkles,
} from 'lucide-react'
import type { PromptTemplate } from '@/types'

const iconMap: Record<string, typeof Layout> = {
  Layout, Database, Zap, Bug, Component, RefreshCw, TestTube, Sparkles,
}

interface TemplateCardProps {
  template: PromptTemplate
  onClick: () => void
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  const Icon = iconMap[template.icon] || Sparkles

  return (
    <Box
      as="button"
      onClick={onClick}
      css={{
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid var(--studio-border)',
        background: 'var(--studio-bg-surface)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        '&:hover': {
          borderColor: 'var(--studio-border-hover)',
          transform: 'scale(1.02)',
          background: 'var(--studio-bg-hover)',
        },
      }}
    >
      {/* Icon circle */}
      <Box
        css={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'var(--studio-border)',
          border: '1px solid var(--studio-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--studio-text-primary)',
          flexShrink: 0,
        }}
      >
        <Icon size={20} />
      </Box>

      <Box>
        <Text
          css={{
            fontWeight: 600,
            fontSize: '14px',
            color: 'var(--studio-text-primary)',
            letterSpacing: '-0.01em',
            marginBottom: '4px',
          }}
        >
          {template.name}
        </Text>
        <Text
          css={{
            fontSize: '13px',
            color: 'var(--studio-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {template.description}
        </Text>
      </Box>

      {/* Category dot + text */}
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: 'auto',
        }}
      >
        <Box
          css={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: 'var(--studio-text-muted)',
            flexShrink: 0,
          }}
        />
        <Text
          css={{
            fontSize: '11px',
            color: 'var(--studio-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontWeight: 500,
          }}
        >
          {template.category}
        </Text>
      </Box>
    </Box>
  )
}
