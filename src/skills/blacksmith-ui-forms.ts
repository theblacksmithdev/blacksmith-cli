import type { Skill, SkillContext } from './types.js'

export const blacksmithUiFormsSkill: Skill = {
  id: 'blacksmith-ui-forms',
  filename: 'blacksmith-ui-forms.md',

  render(_ctx: SkillContext): string {
    return `## @blacksmith-ui/forms — Form Components (React Hook Form + Zod)

> **RULE: ALWAYS use these for forms.** Do NOT build forms with raw \`<form>\`, \`<input>\`, \`<label>\`, or manual error display.

\`\`\`tsx
import { Form, FormField, FormInput, FormTextarea, FormSelect } from '@blacksmith-ui/forms'
\`\`\`

### Components

- \`Form\` — Wraps the entire form. Props: \`form\` (useForm instance), \`onSubmit\`
- \`FormField\` — Wraps each field. Props: \`name\`, \`label\`, \`description?\`
- \`FormInput\` — Text input within FormField. Props: \`type\`, \`placeholder\`
- \`FormTextarea\` — Textarea within FormField. Props: \`rows\`, \`placeholder\`
- \`FormSelect\` — Select within FormField. Props: \`options\`, \`placeholder\`
- \`FormCheckbox\` — Checkbox within FormField
- \`FormSwitch\` — Toggle switch within FormField
- \`FormRadioGroup\` — Radio group within FormField. Props: \`options\`
- \`FormDatePicker\` — Date picker within FormField
- \`FormError\` — Displays field-level validation error (auto-handled by FormField)
- \`FormDescription\` — Displays helper text below a field

### Rules
- NEVER use raw \`<form>\` with manual \`<label>\` and error \`<p>\` tags. Always use \`Form\` + \`FormField\`.
- NEVER use \`<input>\`, \`<textarea>\`, \`<select>\` inside forms. Use \`FormInput\`, \`FormTextarea\`, \`FormSelect\`.

### Form Pattern — ALWAYS follow this:
\`\`\`tsx
import { Form, FormField, FormInput, FormTextarea, FormSelect } from '@blacksmith-ui/forms'
import { Button } from '@blacksmith-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']),
})

type FormData = z.infer<typeof schema>

function ResourceForm({ defaultValues, onSubmit, isSubmitting }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', status: 'draft', ...defaultValues },
  })

  return (
    <Form form={form} onSubmit={onSubmit}>
      <FormField name="title" label="Title">
        <FormInput placeholder="Enter title" />
      </FormField>
      <FormField name="description" label="Description">
        <FormTextarea rows={4} placeholder="Enter description" />
      </FormField>
      <FormField name="status" label="Status">
        <FormSelect options={[
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ]} />
      </FormField>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </Form>
  )
}
\`\`\`

### Example: Detail Page with Edit Dialog
\`\`\`tsx
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Button, Badge, Separator,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Alert, AlertTitle, AlertDescription,
} from '@blacksmith-ui/react'
import { Form, FormField, FormInput, FormTextarea } from '@blacksmith-ui/forms'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Edit, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const editSchema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().optional(),
})

function ResourceDetailPage({ resource, onUpdate, error }) {
  const form = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: { title: resource.title, description: resource.description },
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{resource.title}</CardTitle>
            <CardDescription>Created {new Date(resource.created_at).toLocaleDateString()}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/resources"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button><Edit className="mr-2 h-4 w-4" /> Edit</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Resource</DialogTitle>
                </DialogHeader>
                <Form form={form} onSubmit={onUpdate}>
                  <FormField name="title" label="Title">
                    <FormInput />
                  </FormField>
                  <FormField name="description" label="Description">
                    <FormTextarea rows={4} />
                  </FormField>
                  <DialogFooter>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <p>{resource.description || 'No description provided.'}</p>
      </CardContent>
      <CardFooter>
        <Badge>{resource.status}</Badge>
      </CardFooter>
    </Card>
  )
}
\`\`\`
`
  },
}
