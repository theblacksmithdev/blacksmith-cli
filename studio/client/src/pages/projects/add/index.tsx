import { useState } from 'react'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FolderOpen, Plus, Anvil } from 'lucide-react'
import { Path } from '@/router/paths'
import { ChooseType } from './choose-type'
import { ImportExisting } from './import-existing'
import { CreateNew } from './create-new'

type Step = 'choose' | 'import-existing' | 'create-new'

export default function AddProjectPage() {
  const [step, setStep] = useState<Step>('choose')
  const navigate = useNavigate()

  return (
    <Box
      css={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'var(--studio-bg-main)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <HStack
        gap={3}
        css={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--studio-border)',
          flexShrink: 0,
        }}
      >
        <Box
          as="button"
          onClick={() => step === 'choose' ? navigate(Path.Home) : setStep('choose')}
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            color: 'var(--studio-text-secondary)',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.12s ease',
            '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-primary)' },
          }}
        >
          <ArrowLeft size={15} />
          {step === 'choose' ? 'Dashboard' : 'Back'}
        </Box>
        <Box css={{ flex: 1 }} />
        <HStack gap={2}>
          <Anvil size={16} style={{ color: 'var(--studio-text-muted)' }} />
          <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-secondary)' }}>
            Add Project
          </Text>
        </HStack>
        <Box css={{ flex: 1 }} />
        <Box css={{ width: '80px' }} /> {/* Spacer to center title */}
      </HStack>

      {/* Content */}
      <Box css={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {step === 'choose' && (
          <ChooseType
            onExisting={() => setStep('import-existing')}
            onNew={() => setStep('create-new')}
          />
        )}
        {step === 'import-existing' && (
          <ImportExisting />
        )}
        {step === 'create-new' && (
          <CreateNew />
        )}
      </Box>
    </Box>
  )
}
