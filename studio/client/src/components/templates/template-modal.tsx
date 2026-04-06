import { useState } from 'react'
import {
  Dialog, Field, Input, Textarea, NativeSelect, Button, VStack,
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => { if (!e.open) onClose() }} size="lg">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="gray.800">
          <Dialog.Header>{template.name}</Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body>
            <VStack gap={4}>
              {template.fields.map((field) => (
                <Field.Root key={field.name} required={field.required}>
                  <Field.Label fontSize="sm">{field.label}</Field.Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      value={values[field.name] || ''}
                      onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      size="sm"
                      bg="gray.900"
                    />
                  ) : field.type === 'select' ? (
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field
                        value={values[field.name] || ''}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setValues({ ...values, [field.name]: e.target.value })}
                        bg="gray.900"
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
                      bg="gray.900"
                    />
                  )}
                </Field.Root>
              ))}
            </VStack>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="ghost" mr={2} onClick={onClose}>Cancel</Button>
            <Button
              colorPalette="blue"
              onClick={handleSubmit}
              disabled={!allRequiredFilled}
            >
              Send to Claude
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
