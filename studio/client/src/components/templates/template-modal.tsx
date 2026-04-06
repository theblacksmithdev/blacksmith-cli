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
    background: '#0c0c0e',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '8px',
    color: '#e8e8ed',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    '&:focus': {
      borderColor: 'rgba(13,148,136,0.5)',
      boxShadow: '0 0 0 2px rgba(13,148,136,0.2)',
      outline: 'none',
    },
    '&::placeholder': {
      color: '#55555f',
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
            background: '#141416',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}
        >
          <Dialog.Header
            css={{
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              padding: '20px 24px',
            }}
          >
            <Text
              css={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#e8e8ed',
                letterSpacing: '-0.01em',
              }}
            >
              {template.name}
            </Text>
          </Dialog.Header>
          <Dialog.CloseTrigger
            css={{
              color: '#55555f',
              '&:hover': { color: '#85858f' },
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
                      color: '#85858f',
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
              borderTop: '1px solid rgba(255,255,255,0.07)',
              padding: '16px 24px',
              gap: '8px',
            }}
          >
            <Button
              variant="ghost"
              onClick={onClose}
              css={{
                color: '#85858f',
                borderRadius: '8px',
                '&:hover': {
                  background: '#1c1c20',
                  color: '#e8e8ed',
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
                  ? 'linear-gradient(135deg, #0d9488, #14b8a6)'
                  : '#1c1c20',
                color: allRequiredFilled ? '#ffffff' : '#55555f',
                fontWeight: 500,
                fontSize: '14px',
                border: 'none',
                cursor: allRequiredFilled ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                '&:hover': allRequiredFilled ? {
                  boxShadow: '0 4px 12px rgba(13,148,136,0.3)',
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
