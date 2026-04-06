import { useState } from 'react'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { FolderOpen, Anvil, Package, GitBranch, Folder } from 'lucide-react'
import { api } from '@/api/client'
import { useProjects } from '@/hooks/use-projects'
import { FolderPicker } from './folder-picker'

interface ValidationResult {
  valid: boolean
  path: string
  name: string
  isBlacksmithProject: boolean
  hasPackageJson: boolean
  hasGit: boolean
}

export function ImportExisting() {
  const navigate = useNavigate()
  const { register } = useProjects()

  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [projectName, setProjectName] = useState('')
  const [nameEdited, setNameEdited] = useState(false)
  const [registering, setRegistering] = useState(false)

  const handleFolderSelected = async (path: string) => {
    setSelectedPath(path)
    try {
      const result = await api.post<ValidationResult>('/projects/validate', { path })
      setValidation(result)
      if (result.name && !nameEdited) {
        setProjectName(result.name)
      }
    } catch {
      setValidation(null)
    }
  }

  const handleRegister = async () => {
    if (!selectedPath || !validation?.valid) return
    setRegistering(true)
    try {
      const project = await register(selectedPath, projectName || validation.name)
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

      {/* Folder selector field */}
      <Box css={{ width: '100%' }}>
        <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '6px' }}>
          Project folder
        </Text>
        <Box
          as="button"
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
          <FolderOpen size={16} style={{ color: selectedPath ? 'var(--studio-green)' : 'var(--studio-text-muted)', flexShrink: 0 }} />
          <Text
            css={{
              flex: 1,
              fontSize: '13px',
              color: selectedPath ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: selectedPath ? "'SF Mono', 'Fira Code', Menlo, monospace" : 'inherit',
            }}
          >
            {selectedPath || 'Choose a folder...'}
          </Text>
          <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', flexShrink: 0 }}>
            Browse
          </Text>
        </Box>
      </Box>

      {/* Validation badges + name */}
      {validation?.valid && (
        <Box
          css={{
            width: '100%',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid var(--studio-border)',
            background: 'var(--studio-bg-sidebar)',
          }}
        >
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

          <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '6px' }}>
            Project name
          </Text>
          <input
            type="text"
            value={projectName}
            onChange={(e) => { setProjectName(e.target.value); setNameEdited(true) }}
            placeholder={validation.name}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '7px',
              border: '1px solid var(--studio-border)',
              background: 'var(--studio-bg-surface)',
              color: 'var(--studio-text-primary)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </Box>
      )}

      {/* Register button */}
      <Box
        as="button"
        onClick={handleRegister}
        css={{
          width: '100%',
          padding: '12px',
          borderRadius: '10px',
          border: 'none',
          background: validation?.valid ? 'var(--studio-accent)' : 'var(--studio-bg-surface)',
          color: validation?.valid ? 'var(--studio-accent-fg)' : 'var(--studio-text-muted)',
          fontSize: '14px',
          fontWeight: 500,
          cursor: validation?.valid ? 'pointer' : 'default',
          transition: 'all 0.15s ease',
          '&:hover': validation?.valid ? { opacity: 0.9 } : {},
        }}
      >
        {registering ? 'Adding project...' : 'Add to Studio'}
      </Box>

      {/* Folder picker modal */}
      <FolderPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleFolderSelected}
      />
    </VStack>
  )
}
