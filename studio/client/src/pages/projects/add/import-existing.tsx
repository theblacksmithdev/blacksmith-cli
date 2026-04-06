import { useState } from 'react'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FolderOpen, Anvil, Package, GitBranch, Folder } from 'lucide-react'
import { api } from '@/api/client'
import { useProjects } from '@/hooks/use-projects'
import { FormField, inputCss } from '@/components/forms/form-field'
import { FolderPicker } from './folder-picker'

interface ValidationResult {
  valid: boolean
  path: string
  name: string
  isBlacksmithProject: boolean
  hasPackageJson: boolean
  hasGit: boolean
}

const schema = z.object({
  projectPath: z.string().min(1, 'Select a project folder'),
  projectName: z.string().min(1, 'Project name is required'),
})

type FormData = z.infer<typeof schema>

export function ImportExisting() {
  const navigate = useNavigate()
  const { register: registerProject } = useProjects()

  const [pickerOpen, setPickerOpen] = useState(false)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [registering, setRegistering] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { projectPath: '', projectName: '' },
  })

  const projectPath = watch('projectPath')

  const handleFolderSelected = async (path: string) => {
    setValue('projectPath', path, { shouldValidate: true })
    try {
      const result = await api.post<ValidationResult>('/projects/validate', { path })
      setValidation(result)
      if (result.name) {
        setValue('projectName', result.name, { shouldValidate: true })
      }
    } catch {
      setValidation(null)
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!validation?.valid) return
    setRegistering(true)
    try {
      const project = await registerProject(data.projectPath, data.projectName)
      navigate(`/${project.id}`)
    } catch {
      setRegistering(false)
    }
  }

  return (
    <VStack gap={6} css={{ maxWidth: '480px', width: '100%', padding: '0 24px' }}>
      <VStack gap={2}>
        <Text css={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--studio-text-primary)', textAlign: 'center' }}>
          Import existing project
        </Text>
        <Text css={{ fontSize: '14px', color: 'var(--studio-text-tertiary)', textAlign: 'center' }}>
          Select your project folder to add it to Studio.
        </Text>
      </VStack>

      <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
        <VStack gap={4} align="stretch">
          {/* Folder selector */}
          <FormField label="Project folder" error={errors.projectPath?.message}>
            <Box
              as="button"
              type="button"
              onClick={() => setPickerOpen(true)}
              css={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid var(--studio-border)',
                background: 'var(--studio-bg-surface)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.12s ease',
                '&:hover': { borderColor: 'var(--studio-border-hover)' },
              }}
            >
              <FolderOpen size={16} style={{ color: projectPath ? 'var(--studio-green)' : 'var(--studio-text-muted)', flexShrink: 0 }} />
              <Text css={{
                flex: 1, fontSize: '13px',
                color: projectPath ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontFamily: projectPath ? "'SF Mono', 'Fira Code', Menlo, monospace" : 'inherit',
              }}>
                {projectPath || 'Choose a folder...'}
              </Text>
              <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', flexShrink: 0 }}>Browse</Text>
            </Box>
          </FormField>

          {/* Validation info + name */}
          {validation?.valid && (
            <Box css={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--studio-border)', background: 'var(--studio-bg-sidebar)' }}>
              <HStack gap={3} css={{ marginBottom: '14px' }}>
                {validation.isBlacksmithProject ? (
                  <HStack gap={2} css={{ fontSize: '12px', color: 'var(--studio-green)' }}>
                    <Anvil size={14} /> <Text>Blacksmith project</Text>
                  </HStack>
                ) : (
                  <HStack gap={2} css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)' }}>
                    <Folder size={14} /> <Text>Project folder</Text>
                  </HStack>
                )}
                {validation.hasPackageJson && (
                  <HStack gap={1} css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)' }}>
                    <Package size={12} /> <Text>npm</Text>
                  </HStack>
                )}
                {validation.hasGit && (
                  <HStack gap={1} css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)' }}>
                    <GitBranch size={12} /> <Text>git</Text>
                  </HStack>
                )}
              </HStack>

              <FormField label="Project name" error={errors.projectName?.message}>
                <input {...register('projectName')} placeholder={validation.name} style={inputCss} />
              </FormField>
            </Box>
          )}

          {/* Submit */}
          <Box
            as="button"
            type="submit"
            disabled={!validation?.valid || registering}
            css={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
              background: validation?.valid ? 'var(--studio-accent)' : 'var(--studio-bg-surface)',
              color: validation?.valid ? 'var(--studio-accent-fg)' : 'var(--studio-text-muted)',
              fontSize: '14px', fontWeight: 500,
              cursor: validation?.valid ? 'pointer' : 'default',
              transition: 'all 0.15s ease',
              '&:hover': validation?.valid ? { opacity: 0.9 } : {},
            }}
          >
            {registering ? 'Adding project...' : 'Add to Studio'}
          </Box>
        </VStack>
      </form>

      <FolderPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleFolderSelected}
      />
    </VStack>
  )
}
