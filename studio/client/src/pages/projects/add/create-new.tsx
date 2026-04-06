import { useState } from 'react'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FolderOpen, Anvil, Loader2, Check, AlertCircle } from 'lucide-react'
import { api } from '@/api/client'
import { FormField, inputCss, selectCss } from '@/components/forms/form-field'
import { FolderPicker } from './folder-picker'

const THEMES = ['default', 'blue', 'green', 'violet', 'red', 'neutral'] as const

const schema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, hyphens, and underscores'),
  parentPath: z.string().min(1, 'Select a location for your project'),
  backendPort: z.coerce.number().int().min(1024, 'Port must be 1024+').max(65535, 'Port must be under 65535'),
  frontendPort: z.coerce.number().int().min(1024, 'Port must be 1024+').max(65535, 'Port must be under 65535'),
  theme: z.enum(THEMES),
})

type FormData = z.infer<typeof schema>

type CreateState = 'idle' | 'creating' | 'success' | 'error'

interface CreateResult {
  project: { id: string; name: string; path: string }
  output: string
}

export function CreateNew() {
  const navigate = useNavigate()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [state, setState] = useState<CreateState>('idle')
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      parentPath: '',
      backendPort: 8000,
      frontendPort: 5173,
      theme: 'default',
    },
  })

  const parentPath = watch('parentPath')
  const name = watch('name')

  const onSubmit = async (data: FormData) => {
    setState('creating')
    setServerError('')
    try {
      const result = await api.post<CreateResult>('/projects/create', { ...data, ai: true })
      setState('success')
      setTimeout(() => navigate(`/${result.project.id}`), 1000)
    } catch (err: any) {
      setState('error')
      setServerError(err.message || 'Failed to create project')
    }
  }

  const isSubmitting = state === 'creating'

  return (
    <VStack gap={6} css={{ maxWidth: '480px', width: '100%', padding: '0 24px' }}>
      <VStack gap={2}>
        <Text css={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--studio-text-primary)', textAlign: 'center' }}>
          Create new project
        </Text>
        <Text css={{ fontSize: '14px', color: 'var(--studio-text-tertiary)', textAlign: 'center' }}>
          Scaffold a fullstack Django + React project.
        </Text>
      </VStack>

      <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
        <VStack gap={4} align="stretch">
          <FormField label="Project name" error={errors.name?.message}>
            <input {...register('name')} placeholder="my-project" style={inputCss} />
          </FormField>

          <FormField label="Location" error={errors.parentPath?.message}>
            <Box
              as="button"
              type="button"
              onClick={() => setPickerOpen(true)}
              css={{
                ...inputCss,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                '&:hover': { borderColor: 'var(--studio-border-hover)' },
              }}
            >
              <FolderOpen size={15} style={{ color: parentPath ? 'var(--studio-green)' : 'var(--studio-text-muted)', flexShrink: 0 }} />
              <Text css={{
                flex: 1, fontSize: '13px',
                color: parentPath ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontFamily: parentPath ? "'SF Mono', Menlo, monospace" : 'inherit',
              }}>
                {parentPath || 'Select a folder...'}
              </Text>
              <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', flexShrink: 0 }}>Browse</Text>
            </Box>
            {parentPath && name && (
              <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', marginTop: '4px', fontFamily: "'SF Mono', Menlo, monospace" }}>
                {parentPath}/{name}
              </Text>
            )}
          </FormField>

          <HStack gap={3}>
            <FormField label="Backend port" error={errors.backendPort?.message}>
              <input type="number" {...register('backendPort')} style={inputCss} />
            </FormField>
            <FormField label="Frontend port" error={errors.frontendPort?.message}>
              <input type="number" {...register('frontendPort')} style={inputCss} />
            </FormField>
          </HStack>

          <FormField label="Theme" error={errors.theme?.message}>
            <select {...register('theme')} style={selectCss}>
              {THEMES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </FormField>

          <HStack gap={3} css={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--studio-border)', background: 'var(--studio-bg-sidebar)' }}>
            <Anvil size={16} style={{ color: 'var(--studio-green)', flexShrink: 0 }} />
            <Box css={{ flex: 1 }}>
              <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>AI coding support included</Text>
              <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)' }}>CLAUDE.md and AI skills generated automatically</Text>
            </Box>
            <Check size={14} style={{ color: 'var(--studio-green)', flexShrink: 0 }} />
          </HStack>

          {state === 'error' && (
            <HStack gap={2} css={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle size={14} style={{ color: 'var(--studio-error)', flexShrink: 0 }} />
              <Text css={{ fontSize: '13px', color: 'var(--studio-error)' }}>{serverError}</Text>
            </HStack>
          )}

          <Box
            as="button"
            type="submit"
            disabled={isSubmitting}
            css={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
              background: isSubmitting ? 'var(--studio-bg-surface)' : 'var(--studio-accent)',
              color: isSubmitting ? 'var(--studio-text-muted)' : 'var(--studio-accent-fg)',
              fontSize: '14px', fontWeight: 500,
              cursor: isSubmitting ? 'default' : 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              '&:hover': isSubmitting ? {} : { opacity: 0.9 },
            }}
          >
            {state === 'creating' && <Loader2 size={16} style={{ animation: 'shimmer 1s ease infinite' }} />}
            {state === 'success' && <Check size={16} />}
            {state === 'creating' ? 'Creating project...' : state === 'success' ? 'Project created!' : 'Create Project'}
          </Box>
        </VStack>
      </form>

      <FolderPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(p) => setValue('parentPath', p, { shouldValidate: true })}
      />
    </VStack>
  )
}
