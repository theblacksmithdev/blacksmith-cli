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
        border: '1px solid rgba(255,255,255,0.06)',
        background: '#12121a',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        '&:hover': {
          borderColor: 'rgba(255,255,255,0.12)',
          transform: 'scale(1.02)',
          background: '#1a1a26',
        },
      }}
    >
      {/* Icon circle */}
      <Box
        css={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#818cf8',
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
            color: '#f0f0f5',
            letterSpacing: '-0.01em',
            marginBottom: '4px',
          }}
        >
          {template.name}
        </Text>
        <Text
          css={{
            fontSize: '13px',
            color: '#8888a0',
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
            background: '#6366f1',
            flexShrink: 0,
          }}
        />
        <Text
          css={{
            fontSize: '11px',
            color: '#555568',
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
