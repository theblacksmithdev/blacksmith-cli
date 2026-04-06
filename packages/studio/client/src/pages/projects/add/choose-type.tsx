import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { FolderOpen, Plus, ArrowRight } from 'lucide-react'

interface ChooseTypeProps {
  onExisting: () => void
  onNew: () => void
}

export function ChooseType({ onExisting, onNew }: ChooseTypeProps) {
  return (
    <VStack gap={8} css={{ maxWidth: '520px', width: '100%', padding: '0 24px' }}>
      <VStack gap={2}>
        <Text css={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--studio-text-primary)', textAlign: 'center' }}>
          Add a project
        </Text>
        <Text css={{ fontSize: '14px', color: 'var(--studio-text-tertiary)', textAlign: 'center' }}>
          Import an existing project or create a new one from scratch.
        </Text>
      </VStack>

      <VStack gap={3} align="stretch" css={{ width: '100%' }}>
        <OptionCard
          icon={<FolderOpen size={22} />}
          title="Import existing project"
          description="Select a folder on your machine that already has a project in it."
          onClick={onExisting}
        />
        <OptionCard
          icon={<Plus size={22} />}
          title="Create new project"
          description="Scaffold a new Blacksmith project with Django backend and React frontend."
          onClick={onNew}
        />
      </VStack>
    </VStack>
  )
}

function OptionCard({ icon, title, description, onClick, disabled }: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Box
      as="button"
      onClick={disabled ? undefined : onClick}
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid var(--studio-border)',
        background: 'var(--studio-bg-sidebar)',
        cursor: disabled ? 'default' : 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.5 : 1,
        '&:hover': disabled ? {} : {
          borderColor: 'var(--studio-border-hover)',
          background: 'var(--studio-bg-hover)',
          '& .option-arrow': { opacity: 1, transform: 'translateX(0)' },
        },
      }}
    >
      <Box
        css={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'var(--studio-bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--studio-text-tertiary)',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box css={{ flex: 1 }}>
        <Text css={{ fontSize: '15px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '2px' }}>
          {title}
        </Text>
        <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', lineHeight: 1.4 }}>
          {description}
        </Text>
        {disabled && (
          <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', marginTop: '4px' }}>
            Coming soon
          </Text>
        )}
      </Box>
      {!disabled && (
        <Box
          className="option-arrow"
          css={{
            opacity: 0,
            transform: 'translateX(-4px)',
            transition: 'all 0.15s ease',
            color: 'var(--studio-text-muted)',
            flexShrink: 0,
          }}
        >
          <ArrowRight size={18} />
        </Box>
      )}
    </Box>
  )
}
