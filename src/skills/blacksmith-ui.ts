import type { Skill, SkillContext } from './types.js'

export const blacksmithUiSkill: Skill = {
  id: 'blacksmith-ui',

  render(_ctx: SkillContext): string {
    return `## Blacksmith-UI Component Library — MANDATORY

> **CRITICAL RULE: Every UI element MUST be built using \`@blacksmith-ui\` components.**
> Do NOT use raw HTML elements (\`<button>\`, \`<input>\`, \`<form>\`, \`<table>\`, \`<div>\` as cards, etc.) when a Blacksmith-UI component exists for that purpose.
> Only fall back to plain HTML/Tailwind for layout primitives (\`<div>\`, \`<main>\`, \`<section>\`, \`<nav>\` for structure) or when no equivalent Blacksmith-UI component exists.

### Packages

#### \`@blacksmith-ui/react\` — Core UI Components
Every visual element should come from this package. Available components:

**Layout & Containers:**
- \`Card\`, \`CardHeader\`, \`CardTitle\`, \`CardDescription\`, \`CardContent\`, \`CardFooter\` — Use instead of styled \`<div>\` containers
- \`Dialog\`, \`DialogTrigger\`, \`DialogContent\`, \`DialogHeader\`, \`DialogTitle\`, \`DialogDescription\`, \`DialogFooter\` — Use for modals, confirmations, popups
- \`Sheet\`, \`SheetTrigger\`, \`SheetContent\`, \`SheetHeader\`, \`SheetTitle\`, \`SheetDescription\` — Use for slide-over panels
- \`Tabs\`, \`TabsList\`, \`TabsTrigger\`, \`TabsContent\` — Use for tabbed interfaces
- \`Accordion\`, \`AccordionItem\`, \`AccordionTrigger\`, \`AccordionContent\` — Use for collapsible sections
- \`Separator\` — Use instead of \`<hr>\` or border dividers

**Actions:**
- \`Button\` — Use instead of \`<button>\` or \`<a>\` styled as buttons
  - Variants: \`default\`, \`secondary\`, \`destructive\`, \`outline\`, \`ghost\`, \`link\`
  - Sizes: \`sm\`, \`default\`, \`lg\`, \`icon\`
- \`DropdownMenu\`, \`DropdownMenuTrigger\`, \`DropdownMenuContent\`, \`DropdownMenuItem\`, \`DropdownMenuSeparator\`, \`DropdownMenuLabel\` — Use for action menus
- \`AlertDialog\`, \`AlertDialogTrigger\`, \`AlertDialogContent\`, \`AlertDialogAction\`, \`AlertDialogCancel\` — Use for destructive action confirmations

**Data Entry:**
- \`Input\` — Use instead of \`<input>\`
- \`Textarea\` — Use instead of \`<textarea>\`
- \`Select\`, \`SelectTrigger\`, \`SelectContent\`, \`SelectItem\`, \`SelectValue\` — Use instead of \`<select>\`
- \`Checkbox\` — Use instead of \`<input type="checkbox">\`
- \`RadioGroup\`, \`RadioGroupItem\` — Use instead of \`<input type="radio">\`
- \`Switch\` — Use for toggle switches
- \`Slider\` — Use for range inputs
- \`DatePicker\` — Use for date selection
- \`Label\` — Use instead of \`<label>\`

**Data Display:**
- \`Table\`, \`TableHeader\`, \`TableBody\`, \`TableRow\`, \`TableHead\`, \`TableCell\` — Use instead of \`<table>\` elements
- \`Badge\` — Use for status indicators, tags, counts
  - Variants: \`default\`, \`secondary\`, \`destructive\`, \`outline\`
- \`Avatar\`, \`AvatarImage\`, \`AvatarFallback\` — Use for user profile images
- \`Tooltip\`, \`TooltipTrigger\`, \`TooltipContent\`, \`TooltipProvider\` — Use for hover hints
- \`Skeleton\` — Use for loading placeholders instead of custom \`animate-pulse\` divs
- \`Progress\` — Use for progress bars

**Feedback:**
- \`Alert\`, \`AlertTitle\`, \`AlertDescription\` — Use for inline messages/warnings
- \`Toast\` / \`useToast\` — Use for transient notifications
- \`Spinner\` — Use for loading indicators

**Navigation:**
- \`Breadcrumb\`, \`BreadcrumbList\`, \`BreadcrumbItem\`, \`BreadcrumbLink\`, \`BreadcrumbSeparator\` — Use for breadcrumb trails
- \`NavigationMenu\`, \`NavigationMenuList\`, \`NavigationMenuItem\`, \`NavigationMenuTrigger\`, \`NavigationMenuContent\` — Use for complex nav menus
- \`Pagination\`, \`PaginationContent\`, \`PaginationItem\`, \`PaginationLink\`, \`PaginationNext\`, \`PaginationPrevious\` — Use for paginated lists
- \`Command\`, \`CommandInput\`, \`CommandList\`, \`CommandItem\`, \`CommandGroup\` — Use for command palette / searchable lists

#### \`@blacksmith-ui/forms\` — Form Components (React Hook Form + Zod)
**ALWAYS use these for forms.** Do NOT build forms with raw \`<form>\`, \`<input>\`, \`<label>\`, or manual error display.

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

**Form pattern — ALWAYS follow this:**
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

#### \`@blacksmith-ui/auth\` — Authentication UI
**ALWAYS use these for auth pages.** Do NOT build custom login/register forms.

- \`AuthProvider\` — Context provider wrapping the app. Props: \`config: { adapter, socialProviders? }\`
- \`LoginForm\` — Complete login form with email/password fields, validation, and links
  - Props: \`onSubmit: (data: { email, password }) => void\`, \`onRegisterClick\`, \`onForgotPasswordClick\`, \`error\`, \`loading\`
- \`RegisterForm\` — Registration form with email, password, and display name
  - Props: \`onSubmit: (data: { email, password, displayName }) => void\`, \`onLoginClick\`, \`error\`, \`loading\`
- \`ForgotPasswordForm\` — Password reset email request
  - Props: \`onSubmit: (data: { email }) => void\`, \`onLoginClick\`, \`error\`, \`loading\`
- \`ResetPasswordForm\` — Set new password form
  - Props: \`onSubmit: (data: { password, code }) => void\`, \`code\`, \`onLoginClick\`, \`error\`, \`loading\`
- \`useAuth\` — Hook for auth state and actions
  - Returns: \`user\`, \`loading\`, \`error\`, \`signInWithEmail(email, password)\`, \`signUpWithEmail(email, password, displayName?)\`, \`signOut()\`, \`sendPasswordResetEmail(email)\`, \`confirmPasswordReset(code, newPassword)\`, \`socialProviders\`
- \`AuthAdapter\` — Interface for custom auth backends (Django JWT adapter already configured in \`frontend/src/features/auth/adapter.ts\`)

### Component Usage Rules

1. **Buttons**: NEVER use \`<button>\` or \`<a>\` styled as a button. Always use \`<Button>\` from \`@blacksmith-ui/react\`.
2. **Inputs**: NEVER use \`<input>\`, \`<textarea>\`, \`<select>\` directly. Use \`Input\`, \`Textarea\`, \`Select\` from \`@blacksmith-ui/react\` for standalone inputs, or \`FormInput\`, \`FormTextarea\`, \`FormSelect\` from \`@blacksmith-ui/forms\` inside forms.
3. **Forms**: NEVER use raw \`<form>\` with manual \`<label>\` and error \`<p>\` tags. Always use \`Form\` + \`FormField\` from \`@blacksmith-ui/forms\`.
4. **Cards**: NEVER use a styled \`<div>\` as a card. Use \`Card\`, \`CardHeader\`, \`CardTitle\`, \`CardContent\` from \`@blacksmith-ui/react\`.
5. **Tables**: NEVER use raw \`<table>\` HTML. Use \`Table\`, \`TableHeader\`, \`TableBody\`, \`TableRow\`, \`TableHead\`, \`TableCell\` from \`@blacksmith-ui/react\`.
6. **Loading states**: NEVER use custom \`animate-pulse\` divs. Use \`Skeleton\` or \`Spinner\` from \`@blacksmith-ui/react\`.
7. **Modals/Dialogs**: NEVER build custom modals. Use \`Dialog\` or \`AlertDialog\` from \`@blacksmith-ui/react\`.
8. **Auth pages**: NEVER build custom login/register forms. Use \`LoginForm\`, \`RegisterForm\`, etc. from \`@blacksmith-ui/auth\`.
9. **Feedback**: NEVER use plain styled text for errors/warnings. Use \`Alert\` for inline messages and \`useToast\` for transient notifications.
10. **Dropdowns**: NEVER use custom dropdown implementations. Use \`DropdownMenu\` or \`Select\` from \`@blacksmith-ui/react\`.

### When Raw HTML IS Acceptable
- **Structural layout**: \`<div>\`, \`<main>\`, \`<section>\`, \`<header>\`, \`<footer>\`, \`<nav>\` for page structure and flex/grid containers
- **Text content**: \`<h1>\`–\`<h6>\`, \`<p>\`, \`<span>\` for content text
- **Content lists**: \`<ul>\`, \`<ol>\`, \`<li>\` for simple non-interactive lists
- **Navigation links**: \`<Link>\` from react-router-dom for page navigation (not styled as buttons — use \`<Button asChild><Link>...</Link></Button>\` if it needs to look like a button)
- **Images**: \`<img>\` for content images (use \`Avatar\` for profile pictures)
- **Icons**: Components from \`lucide-react\`

### Design Tokens & Theming
- All components use HSL CSS variables for theming (defined in \`frontend/src/styles/globals.css\`)
- Color variants: \`default\`, \`secondary\`, \`destructive\`, \`outline\`, \`ghost\`, \`link\`
- Sizes: \`sm\`, \`default\`, \`lg\`, \`icon\`
- Border radius: controlled by \`--radius\` CSS variable
- Dark mode: automatic via \`class\` strategy on \`<html>\`
- Extend with \`className\` prop + \`cn()\` utility for custom styles
- Global styles imported via \`@import '@blacksmith-ui/react/styles.css'\` in \`globals.css\`

### Example: Building a Resource List Page (Correct Way)
\`\`\`tsx
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Badge, Skeleton,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogAction, AlertDialogCancel,
} from '@blacksmith-ui/react'
import { MoreHorizontal, Plus, Trash2, Edit } from 'lucide-react'
import { Link } from 'react-router-dom'

function ResourceListPage({ resources, isLoading, onDelete }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Resources</CardTitle>
        <Button asChild>
          <Link to="/resources/new"><Plus className="mr-2 h-4 w-4" /> Create</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.title}</TableCell>
                <TableCell><Badge variant="outline">{r.status}</Badge></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link to={\`/resources/\${r.id}/edit\`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogAction onClick={() => onDelete(r.id)}>
                            Delete
                          </AlertDialogAction>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
\`\`\`

### Example: Building a Detail Page with Edit Dialog (Correct Way)
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
import { Link, useParams } from 'react-router-dom'

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
