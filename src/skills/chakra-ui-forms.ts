import type { Skill, SkillContext } from './types.js'

export const chakraUiFormsSkill: Skill = {
  id: 'chakra-ui-forms',
  name: 'Chakra UI Forms',
  description: 'Form components using Chakra UI v3 (Field) + React Hook Form + Zod for validation and submission.',

  render(_ctx: SkillContext): string {
    return `## Chakra UI Forms — Form Components (v3 + React Hook Form + Zod)

> **RULE: ALWAYS use Chakra UI \`Field\` components for forms.** Do NOT build forms with raw \`<input>\`, \`<label>\`, or manual error display.
> v2 names (\`FormControl\`, \`FormLabel\`, \`FormErrorMessage\`, \`isInvalid\`, \`isRequired\`) do NOT exist in v3.

\`\`\`tsx
import {
  Field, Fieldset, Input, InputGroup, Textarea, NativeSelect,
  Checkbox, Switch, RadioGroup, NumberInput, Button,
} from '@chakra-ui/react'
\`\`\`

### Components

- \`Field.Root\` — Wraps each field. Props: \`invalid\`, \`required\`, \`disabled\`, \`readOnly\` (propagated to the input inside)
- \`Field.Label\` — Label for the field (add \`<Field.RequiredIndicator />\` inside to show an asterisk)
- \`Field.ErrorText\` — Field-level validation error (shown when \`Field.Root\` has \`invalid\`)
- \`Field.HelperText\` — Helper text below a field
- \`Fieldset.Root\`, \`Fieldset.Legend\`, \`Fieldset.Content\` — Group related fields
- \`Input\` — Text input. Props: \`type\`, \`placeholder\`, \`size\`, \`variant\` (\`outline\` | \`subtle\` | \`flushed\`)
- \`InputGroup\` — Input with \`startElement\` / \`endElement\` (icons, units)
- \`Textarea\` — Multi-line text. Props: \`rows\`, \`placeholder\`, \`autoresize\`
- \`NativeSelect.Root\` + \`NativeSelect.Field\` + \`NativeSelect.Indicator\` — Native select (works with \`register\`)
- \`Checkbox.Root\` + \`Checkbox.HiddenInput\` + \`Checkbox.Control\` + \`Checkbox.Label\`
- \`Switch.Root\` + \`Switch.HiddenInput\` + \`Switch.Control\` + \`Switch.Label\`
- \`RadioGroup.Root\` + \`RadioGroup.Item\` + \`RadioGroup.ItemHiddenInput\` + \`RadioGroup.ItemIndicator\` + \`RadioGroup.ItemText\`
- \`NumberInput.Root\` + \`NumberInput.Input\` + \`NumberInput.Control\` — Numeric input with stepper

Controlled components (\`Checkbox\`, \`Switch\`, \`RadioGroup\`, \`NumberInput\`, \`Select\`) use React Hook Form's \`Controller\` and their \`checked\` / \`onCheckedChange\`, \`value\` / \`onValueChange\` props.

### Rules
- NEVER use manual \`<label>\` and error \`<p>\` tags. Always use \`Field.Root\` + \`Field.Label\` + \`Field.ErrorText\`.
- NEVER use \`<input>\`, \`<textarea>\`, \`<select>\` directly. Use Chakra UI \`Input\`, \`Textarea\`, \`NativeSelect\`.
- Submit buttons use \`loading\` / \`loadingText\` (NOT \`isLoading\`) and the default \`brand\` palette (no \`colorScheme\`).
- Show request-level errors with the shared \`StatusAlert\` component above the fields.

### Form Pattern — ALWAYS follow this:
\`\`\`tsx
import { Button, Field, Input, NativeSelect, Stack, Textarea } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { StatusAlert } from '@/shared/components/status-alert'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']),
})

type FormData = z.infer<typeof schema>

function ResourceForm({ defaultValues, onSubmit, isSubmitting, errorMessage }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', status: 'draft', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="5">
        {errorMessage && <StatusAlert message={errorMessage} />}

        <Field.Root invalid={!!errors.title} required>
          <Field.Label>Title</Field.Label>
          <Input placeholder="Enter title" {...register('title')} />
          <Field.ErrorText>{errors.title?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.description}>
          <Field.Label>Description</Field.Label>
          <Textarea rows={4} placeholder="Enter description" {...register('description')} />
          <Field.ErrorText>{errors.description?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.status}>
          <Field.Label>Status</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field {...register('status')}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <Field.ErrorText>{errors.status?.message}</Field.ErrorText>
        </Field.Root>

        <Button type="submit" alignSelf="start" loading={isSubmitting} loadingText="Saving...">
          Save
        </Button>
      </Stack>
    </form>
  )
}
\`\`\`

### Example: Detail Page with Edit Dialog
\`\`\`tsx
import { useState } from 'react'
import {
  Badge, Button, Card, Dialog, Field, HStack, Input, Portal, Stack, Text, Textarea,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/shared/components/page-header'
import { StatusAlert } from '@/shared/components/status-alert'

const editSchema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().optional(),
})

function ResourceDetailPage({ resource, onUpdate, error }) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: { title: resource.title, description: resource.description },
  })

  return (
    <Stack gap="8">
      <PageHeader
        title={resource.title}
        description={\`Created \${new Date(resource.created_at).toLocaleDateString()}\`}
        actions={
          <HStack gap="2">
            <Button asChild variant="outline" size="sm">
              <Link to="/resources"><ArrowLeft /> Back</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              <Pencil /> Edit
            </Button>
          </HStack>
        }
      />

      {error && <StatusAlert title="Error" message={error} />}

      <Card.Root variant="outline">
        <Card.Body>
          <Text>{resource.description || 'No description provided.'}</Text>
        </Card.Body>
        <Card.Footer>
          <Badge variant="outline">{resource.status}</Badge>
        </Card.Footer>
      </Card.Root>

      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content asChild>
              <form onSubmit={handleSubmit(onUpdate)}>
                <Dialog.Header>
                  <Dialog.Title>Edit resource</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Stack gap="4">
                    <Field.Root invalid={!!errors.title}>
                      <Field.Label>Title</Field.Label>
                      <Input {...register('title')} />
                      <Field.ErrorText>{errors.title?.message}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root invalid={!!errors.description}>
                      <Field.Label>Description</Field.Label>
                      <Textarea rows={4} {...register('description')} />
                      <Field.ErrorText>{errors.description?.message}</Field.ErrorText>
                    </Field.Root>
                  </Stack>
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </Dialog.ActionTrigger>
                  <Button type="submit">Save changes</Button>
                </Dialog.Footer>
                <Dialog.CloseTrigger />
              </form>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Stack>
  )
}
\`\`\`
`
  },
}
