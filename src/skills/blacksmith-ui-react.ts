import type { Skill, SkillContext } from './types.js'

export const blacksmithUiReactSkill: Skill = {
  id: 'blacksmith-ui-react',
  name: '@blacksmith-ui/react',
  description: 'Core UI component library — 60+ components for layout, typography, inputs, data display, overlays, feedback, media, and navigation.',

  render(_ctx: SkillContext): string {
    return `## @blacksmith-ui/react — Core UI Components (60+)

> **CRITICAL RULE: Every UI element MUST be built using \`@blacksmith-ui/react\` components — including layout and typography.**
> Do NOT use raw HTML elements when a Blacksmith-UI component exists for that purpose.
> This includes layout: use \`Flex\`, \`Stack\`, \`Grid\`, \`Box\`, \`Container\` instead of \`<div>\` with flex/grid classes.
> This includes typography: use \`Text\` and \`Typography\` instead of raw \`<h1>\`–\`<h6>\`, \`<p>\`, \`<span>\`.

### Layout

| Component | Use instead of | Description |
|-----------|---------------|-------------|
| \`Box\` | \`<div>\` | Base layout primitive with style props |
| \`Flex\` | \`<div className="flex ...">\` | Flexbox container with style props (\`direction\`, \`align\`, \`justify\`, \`gap\`, \`wrap\`) |
| \`Grid\` | \`<div className="grid ...">\` | CSS Grid container (\`columns\`, \`rows\`, \`gap\`) |
| \`Stack\` | \`<div className="flex flex-col gap-...">\` | Vertical/horizontal stack (\`direction\`, \`gap\`) |
| \`Container\` | \`<div className="max-w-7xl mx-auto px-...">\` | Max-width centered container |
| \`Divider\` | \`<hr>\` or border hacks | Visual separator (horizontal/vertical) |
| \`AspectRatio\` | padding-bottom trick | Maintain aspect ratio for content |
| \`Resizable\` | custom resize logic | Resizable panel groups |
| \`ScrollArea\` | \`overflow-auto\` divs | Custom scrollbar container |

### Typography

| Component | Use instead of | Description |
|-----------|---------------|-------------|
| \`Text\` | \`<p>\`, \`<span>\` | Text display with style props (\`size\`, \`weight\`, \`color\`, \`align\`) |
| \`Typography\` | \`<h1>\`–\`<h6>\`, \`<p>\` | Semantic heading/paragraph elements (\`variant\`: h1–h6, p, lead, muted, etc.) |
| \`Label\` | \`<label>\` | Form label with accessibility support |

### Cards & Containers

- \`Card\`, \`CardHeader\`, \`CardTitle\`, \`CardDescription\`, \`CardContent\`, \`CardFooter\` — Use instead of styled \`<div>\` containers
- \`StatCard\` — Use for metric/stat display (value, label, trend)
- \`EmptyState\` — Use for empty content placeholders instead of custom empty divs

### Actions

- \`Button\` — Use instead of \`<button>\` or \`<a>\` styled as buttons
  - Variants: \`default\`, \`secondary\`, \`destructive\`, \`outline\`, \`ghost\`, \`link\`
  - Sizes: \`sm\`, \`default\`, \`lg\`, \`icon\`
- \`Toggle\`, \`ToggleGroup\` — Use for toggle buttons
- \`DropdownMenu\`, \`DropdownMenuTrigger\`, \`DropdownMenuContent\`, \`DropdownMenuItem\`, \`DropdownMenuSeparator\`, \`DropdownMenuLabel\` — Use for action menus
- \`ContextMenu\` — Use for right-click menus
- \`Menubar\` — Use for application menu bars
- \`AlertDialog\`, \`AlertDialogTrigger\`, \`AlertDialogContent\`, \`AlertDialogAction\`, \`AlertDialogCancel\` — Use for destructive action confirmations

### Data Entry

- \`Input\` — Use instead of \`<input>\`
- \`SearchInput\` — Use for search fields (has built-in search icon)
- \`Textarea\` — Use instead of \`<textarea>\`
- \`NumberInput\` — Use for numeric inputs with increment/decrement
- \`Select\`, \`SelectTrigger\`, \`SelectContent\`, \`SelectItem\`, \`SelectValue\` — Use instead of \`<select>\`
- \`Checkbox\` — Use instead of \`<input type="checkbox">\`
- \`RadioGroup\`, \`RadioGroupItem\` — Use instead of \`<input type="radio">\`
- \`Switch\` — Use for toggle switches
- \`Slider\` — Use for single range inputs
- \`RangeSlider\` — Use for dual-handle range selection
- \`DatePicker\` — Use for date selection with calendar popup
- \`PinInput\` / \`InputOTP\` — Use for PIN/OTP code entry
- \`ColorPicker\` — Use for color selection
- \`FileUpload\` — Use for file upload with drag & drop
- \`TagInput\` — Use for tag/chip input with add/remove
- \`Rating\` — Use for star/icon rating selection
- \`Label\` — Use instead of \`<label>\`

### Data Display

- \`Table\`, \`TableHeader\`, \`TableBody\`, \`TableRow\`, \`TableHead\`, \`TableCell\` — Use instead of \`<table>\` elements
- \`DataTable\` — Use for feature-rich tables with sorting, filtering, and pagination
- \`Badge\` — Use for status indicators, tags, counts (variants: \`default\`, \`secondary\`, \`destructive\`, \`outline\`)
- \`Avatar\`, \`AvatarImage\`, \`AvatarFallback\` — Use for user profile images
- \`Tooltip\`, \`TooltipTrigger\`, \`TooltipContent\`, \`TooltipProvider\` — Use for hover hints
- \`HoverCard\` — Use for rich hover content
- \`Calendar\` — Use for full calendar display
- \`Chart\` — Use for data visualization (powered by Recharts)
- \`Timeline\` — Use for chronological event display
- \`Tree\` — Use for hierarchical tree views
- \`List\` — Use for structured list display instead of \`<ul>\`/\`<ol>\`
- \`Skeleton\` — Use for loading placeholders
- \`Spinner\` — Use for loading indicators
- \`Progress\` — Use for progress bars
- \`Pagination\`, \`PaginationContent\`, \`PaginationItem\`, \`PaginationLink\`, \`PaginationNext\`, \`PaginationPrevious\` — Use for paginated lists

### Tabs & Accordion

- \`Tabs\`, \`TabsList\`, \`TabsTrigger\`, \`TabsContent\` — Use for tabbed interfaces
- \`Accordion\`, \`AccordionItem\`, \`AccordionTrigger\`, \`AccordionContent\` — Use for collapsible sections

### Overlays

- \`Dialog\`, \`DialogTrigger\`, \`DialogContent\`, \`DialogHeader\`, \`DialogTitle\`, \`DialogDescription\`, \`DialogFooter\` — Use for modals
- \`AlertDialog\` — Use for confirmation dialogs
- \`Drawer\` / \`Sheet\`, \`SheetTrigger\`, \`SheetContent\`, \`SheetHeader\`, \`SheetTitle\`, \`SheetDescription\` — Use for slide-out panels
- \`Popover\` — Use for floating content panels
- \`CommandPalette\` — Use for searchable command menus (cmdk-based)

### Navigation

- \`Breadcrumb\`, \`BreadcrumbList\`, \`BreadcrumbItem\`, \`BreadcrumbLink\`, \`BreadcrumbSeparator\` — Use for breadcrumb trails
- \`NavigationMenu\`, \`NavigationMenuList\`, \`NavigationMenuItem\`, \`NavigationMenuTrigger\`, \`NavigationMenuContent\` — Use for site navigation
- \`Sidebar\` — Use for app sidebars
- \`Dock\` — Use for macOS-style dock navigation
- \`BackToTop\` — Use for scroll-to-top buttons

### Feedback

- \`Alert\`, \`AlertTitle\`, \`AlertDescription\` — Use for inline messages/warnings
- \`AlertBanner\` — Use for full-width alert banners
- \`Toast\` / \`Toaster\` / \`useToast\` — Use for transient notifications
- \`SonnerToaster\` — Sonner-based toast notifications

### Media

- \`Image\` — Use instead of \`<img>\` for optimized image display
- \`VideoPlayer\` — Use for video playback
- \`CodeBlock\` — Use for syntax-highlighted code (Shiki-powered)
- \`Carousel\` — Use for image/content carousels
- \`Lightbox\` — Use for full-screen media viewers

### Specialized

- \`Stepper\` / \`Wizard\` — Use for multi-step workflows
- \`NotificationCenter\` / \`useNotificationCenter\` — Use for notification management
- \`SpotlightTour\` — Use for guided feature tours

### Utilities & Hooks

- \`cn()\` — Merge class names (clsx + tailwind-merge)
- \`useToast()\` — Programmatic toast notifications
- \`useMobile()\` — Responsive breakpoint detection
- \`useDarkMode()\` — Dark mode toggle. Returns \`{ isDark, toggle }\`

---

### Component-First Rules

1. **Layout**: NEVER use \`<div className="flex ...">\` or \`<div className="grid ...">\`. Use \`<Flex>\`, \`<Grid>\`, \`<Stack>\`, \`<Box>\` from \`@blacksmith-ui/react\`.
2. **Centering/max-width**: NEVER use \`<div className="max-w-7xl mx-auto px-...">\`. Use \`<Container>\`.
3. **Typography**: NEVER use raw \`<h1>\`–\`<h6>\` or \`<p>\` with Tailwind text classes. Use \`<Typography variant="h2">\` or \`<Text>\`.
4. **Separators**: NEVER use \`<hr>\` or border hacks. Use \`<Divider>\`.
5. **Images**: NEVER use raw \`<img>\`. Use \`<Image>\` from \`@blacksmith-ui/react\` (use \`Avatar\` for profile pictures).
6. **Lists**: NEVER use \`<ul>\`/\`<ol>\` for structured display lists. Use \`<List>\` from \`@blacksmith-ui/react\`. Plain \`<ul>\`/\`<ol>\` is only acceptable for simple inline content lists.
7. **Buttons**: NEVER use \`<button>\` or \`<a>\` styled as a button. Use \`<Button>\`.
8. **Inputs**: NEVER use \`<input>\`, \`<textarea>\`, \`<select>\` directly. Use the Blacksmith-UI equivalents.
9. **Cards**: NEVER use a styled \`<div>\` as a card. Use \`Card\` + sub-components.
10. **Tables**: NEVER use raw \`<table>\` HTML. Use \`Table\` or \`DataTable\`.
11. **Loading**: NEVER use custom \`animate-pulse\` divs. Use \`Skeleton\` or \`Spinner\`.
12. **Modals**: NEVER build custom modals. Use \`Dialog\`, \`AlertDialog\`, \`Drawer\`, or \`Sheet\`.
13. **Feedback**: NEVER use plain styled text for errors/warnings. Use \`Alert\` or \`useToast\`.
14. **Empty states**: NEVER build custom empty-state UIs. Use \`EmptyState\`.
15. **Metrics**: NEVER build custom stat/metric cards. Use \`StatCard\`.

### When Raw HTML IS Acceptable

- \`<main>\`, \`<section>\`, \`<header>\`, \`<footer>\`, \`<nav>\`, \`<article>\`, \`<aside>\` — semantic HTML landmarks for page structure (but use \`Flex\`/\`Stack\`/\`Grid\` inside them for layout)
- \`<Link>\` from react-router-dom — for page navigation (use \`<Button asChild><Link>...</Link></Button>\` if it needs button styling)
- Icon components from \`lucide-react\`
- \`<form>\` element when used with React Hook Form (but use \`@blacksmith-ui/forms\` components inside)

### Design Tokens & Theming

- \`ThemeProvider\` — Wrap app to apply preset or custom theme
- Built-in presets: \`default\`, \`blue\`, \`green\`, \`violet\`, \`red\`, \`neutral\`
- All components use HSL CSS variables (\`--background\`, \`--foreground\`, \`--primary\`, etc.)
- Dark mode: \`.dark\` class strategy on \`<html>\`, or \`<ThemeProvider mode="dark">\`
- Border radius: controlled by \`--radius\` CSS variable
- Extend with \`className\` prop + \`cn()\` utility for custom styles
- Global styles: \`@import '@blacksmith-ui/react/styles.css'\` in app entry

### Example: HowItWorks Section (Correct Way)

\`\`\`tsx
import { Container, Stack, Flex, Grid, Text, Typography, Image } from '@blacksmith-ui/react'
import { howItWorksSteps } from '../data'

export function HowItWorks() {
  return (
    <Box as="section" className="py-16 sm:py-20">
      <Container>
        <Stack gap={3} align="center" className="mb-12">
          <Typography variant="h2">How It Works</Typography>
          <Text color="muted">Book your stay in three simple steps</Text>
        </Stack>

        <Grid columns={{ base: 1, md: 3 }} gap={8} className="max-w-4xl mx-auto">
          {howItWorksSteps.map((item) => (
            <Stack key={item.step} align="center" gap={4}>
              <Box className="relative">
                <Flex align="center" justify="center" className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                  <item.icon className="h-7 w-7" />
                </Flex>
                <Flex align="center" justify="center" className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-background border-2 border-primary">
                  <Text size="xs" weight="bold" color="primary">{item.step}</Text>
                </Flex>
              </Box>
              <Stack gap={2} align="center">
                <Text size="lg" weight="bold">{item.title}</Text>
                <Text size="sm" color="muted" align="center" className="max-w-xs">
                  {item.description}
                </Text>
              </Stack>
            </Stack>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
\`\`\`

### Example: Resource List Page (Correct Way)

\`\`\`tsx
import {
  Stack, Flex,
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
        <CardContent className="p-6">
          <Stack gap={4}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </Stack>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <Flex align="center" justify="between">
          <CardTitle>Resources</CardTitle>
          <Button asChild>
            <Link to="/resources/new"><Plus className="mr-2 h-4 w-4" /> Create</Link>
          </Button>
        </Flex>
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
`
  },
}
