import { useState } from 'react'
import {
  Dialog, Field, Input, Textarea, NativeSelect, Button, VStack, Box, Text,
} from '@chakra-ui/react'
import { api } from '@/api/client'
import type { PromptTemplate } from '@/types'

interface TemplateModalProps {
  template: PromptTemplate
  isOpen: boolean
  onClose: () => void
  onSubmit: (prompt: string) => void
}

export function TemplateModal({ template, isOpen, onClose, onSubmit }: TemplateModalProps) {
  const [values, setValues] = useState<Record<string, string>>({})

  const handleSubmit = async () => {
    const data = await api.post<{ prompt: string }>('/templates/interpolate', {
      templateId: template.id,
      values,
    })
    onSubmit(data.prompt)
    onClose()
    setValues({})
  }

  const allRequiredFilled = template.fields
    .filter((f) => f.required)
    .every((f) => values[f.name]?.trim())

  const inputCss = {
    background: 'var(--studio-bg-inset)',
    border: '1px solid var(--studio-border)',
    borderRadius: '8px',
    color: 'var(--studio-text-primary)',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    '&:focus': {
      borderColor: 'rgba(255,255,255,0.2)',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.15)',
      outline: 'none',
    },
    '&::placeholder': {
      color: 'var(--studio-text-tertiary)',
    },
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => { if (!e.open) onClose() }} size="lg">
      <Dialog.Backdrop
        css={{
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
        }}
      />
      <Dialog.Positioner>
        <Dialog.Content
          css={{
            background: 'var(--studio-bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--studio-border)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}
        >
          <Dialog.Header
            css={{
              borderBottom: '1px solid var(--studio-border)',
              padding: '20px 24px',
            }}
          >
            <Text
              css={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--studio-text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              {template.name}
            </Text>
          </Dialog.Header>
          <Dialog.CloseTrigger
            css={{
              color: 'var(--studio-text-tertiary)',
              '&:hover': { color: 'var(--studio-text-secondary)' },
            }}
          />
          <Dialog.Body css={{ padding: '20px 24px' }}>
            <VStack gap={4}>
              {template.fields.map((field) => (
                <Field.Root key={field.name} required={field.required}>
                  <Field.Label
                    css={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--studio-text-secondary)',
                      marginBottom: '4px',
                    }}
                  >
                    {field.label}
                  </Field.Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      value={values[field.name] || ''}
                      onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      size="sm"
                      css={inputCss}
                    />
                  ) : field.type === 'select' ? (
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field
                        value={values[field.name] || ''}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setValues({ ...values, [field.name]: e.target.value })}
                        css={inputCss}
                      >
                        <option value="">Select...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  ) : (
                    <Input
                      value={values[field.name] || ''}
                      onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      size="sm"
                      css={inputCss}
                    />
                  )}
                </Field.Root>
              ))}
            </VStack>
          </Dialog.Body>
          <Dialog.Footer
            css={{
              borderTop: '1px solid var(--studio-border)',
              padding: '16px 24px',
              gap: '8px',
            }}
          >
            <Button
              variant="ghost"
              onClick={onClose}
              css={{
                color: 'var(--studio-text-secondary)',
                borderRadius: '8px',
                '&:hover': {
                  background: 'var(--studio-bg-hover)',
                  color: 'var(--studio-text-primary)',
                },
              }}
            >
              Cancel
            </Button>
            <Box
              as="button"
              onClick={handleSubmit}
              css={{
                padding: '8px 20px',
                borderRadius: '8px',
                background: allRequiredFilled
                  ? 'var(--studio-accent)'
                  : 'var(--studio-bg-surface)',
                color: allRequiredFilled ? 'var(--studio-accent-fg)' : 'var(--studio-text-muted)',
                fontWeight: 500,
                fontSize: '14px',
                border: 'none',
                cursor: allRequiredFilled ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                '&:hover': allRequiredFilled ? {
                  boxShadow: 'var(--studio-shadow)',
                } : {},
              }}
              aria-disabled={!allRequiredFilled}
            >
              Send to Claude
            </Box>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
