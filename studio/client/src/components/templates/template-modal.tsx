import { useState } from 'react'
import {
  Dialog, Field, Input, Textarea, NativeSelect, Button, VStack, Box, Text,
} from '@chakra-ui/react'
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
    const res = await fetch('/api/templates/interpolate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: template.id, values }),
    })
    const data = await res.json()
    onSubmit(data.prompt)
    onClose()
    setValues({})
  }

  const allRequiredFilled = template.fields
    .filter((f) => f.required)
    .every((f) => values[f.name]?.trim())

  const inputCss = {
    background: '#0a0a0f',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    color: '#f0f0f5',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    '&:focus': {
      borderColor: 'rgba(99,102,241,0.4)',
      boxShadow: '0 0 0 2px rgba(99,102,241,0.15)',
      outline: 'none',
    },
    '&::placeholder': {
      color: '#555568',
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
            background: '#12121a',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}
        >
          <Dialog.Header
            css={{
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              padding: '20px 24px',
            }}
          >
            <Text
              css={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#f0f0f5',
                letterSpacing: '-0.01em',
              }}
            >
              {template.name}
            </Text>
          </Dialog.Header>
          <Dialog.CloseTrigger
            css={{
              color: '#555568',
              '&:hover': { color: '#8888a0' },
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
                      color: '#8888a0',
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
              borderTop: '1px solid rgba(255,255,255,0.06)',
              padding: '16px 24px',
              gap: '8px',
            }}
          >
            <Button
              variant="ghost"
              onClick={onClose}
              css={{
                color: '#8888a0',
                borderRadius: '8px',
                '&:hover': {
                  background: '#1a1a26',
                  color: '#f0f0f5',
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
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : '#1a1a26',
                color: allRequiredFilled ? '#ffffff' : '#555568',
                fontWeight: 500,
                fontSize: '14px',
                border: 'none',
                cursor: allRequiredFilled ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                '&:hover': allRequiredFilled ? {
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
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
