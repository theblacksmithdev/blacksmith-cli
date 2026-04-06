import type { Skill, SkillContext } from './types.js'

export const chakraUiFormsSkill: Skill = {
  id: 'chakra-ui-forms',
  name: 'Chakra UI Forms',
  description: 'Form components using Chakra UI + React Hook Form + Zod for validation and submission.',

  render(_ctx: SkillContext): string {
    return `## Chakra UI Forms — Form Components (React Hook Form + Zod)

> **RULE: ALWAYS use Chakra UI form components for forms.** Do NOT build forms with raw \`<form>\`, \`<input>\`, \`<label>\`, or manual error display.

\`\`\`tsx
import {
  FormControl, FormLabel, FormErrorMessage, FormHelperText,
  Input, Textarea, Select, Checkbox, Switch, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Radio, RadioGroup, Button,
} from '@chakra-ui/react'
\`\`\`

### Components

- \`FormControl\` — Wraps each field. Props: \`isInvalid\`, \`isRequired\`, \`isDisabled\`
- \`FormLabel\` — Label for a form field
- \`FormErrorMessage\` — Displays field-level validation error (shown when \`FormControl\` has \`isInvalid\`)
- \`FormHelperText\` — Displays helper text below a field
- \`Input\` — Text input. Props: \`type\`, \`placeholder\`, \`size\`
- \`Textarea\` — Textarea. Props: \`rows\`, \`placeholder\`
- \`Select\` — Select dropdown. Props: \`placeholder\`
- \`Checkbox\` — Checkbox input
- \`Switch\` — Toggle switch
- \`RadioGroup\` + \`Radio\` — Radio group
- \`NumberInput\` — Numeric input with stepper

### Rules
- NEVER use raw \`<form>\` with manual \`<label>\` and error \`<p>\` tags. Always use \`FormControl\` + \`FormLabel\` + \`FormErrorMessage\`.
- NEVER use \`<input>\`, \`<textarea>\`, \`<select>\` inside forms. Use Chakra UI \`Input\`, \`Textarea\`, \`Select\`.

### Form Pattern — ALWAYS follow this:
\`\`\`tsx
import {
  FormControl, FormLabel, FormErrorMessage,
  Input, Textarea, Select, Button, VStack,
} from '@chakra-ui/react'
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
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', status: 'draft', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.title} isRequired>
          <FormLabel>Title</FormLabel>
          <Input placeholder="Enter title" {...register('title')} />
          <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel>Description</FormLabel>
          <Textarea rows={4} placeholder="Enter description" {...register('description')} />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.status}>
          <FormLabel>Status</FormLabel>
          <Select {...register('status')}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
          <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
        </FormControl>

        <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
          Save
        </Button>
      </VStack>
    </form>
  )
}
\`\`\`

### Example: Detail Page with Edit Dialog
\`\`\`tsx
import {
  Card, CardHeader, CardBody, CardFooter,
  Button, Badge, Divider, Heading, Text,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Alert, AlertIcon, AlertTitle, AlertDescription,
  FormControl, FormLabel, FormErrorMessage,
  Input, Textarea, Flex, HStack, useDisclosure,
} from '@chakra-ui/react'
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: { title: resource.title, description: resource.description },
  })

  return (
    <Card>
      <CardHeader>
        <Flex align="center" justify="space-between">
          <Box>
            <Heading size="md">{resource.title}</Heading>
            <Text fontSize="sm" color="gray.500">Created {new Date(resource.created_at).toLocaleDateString()}</Text>
          </Box>
          <HStack spacing={2}>
            <Button variant="outline" as={Link} to="/resources" leftIcon={<ArrowLeft size={16} />}>
              Back
            </Button>
            <Button leftIcon={<Edit size={16} />} colorScheme="blue" onClick={onOpen}>
              Edit
            </Button>
          </HStack>
        </Flex>
      </CardHeader>
      <Divider />
      <CardBody>
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Text>{resource.description || 'No description provided.'}</Text>
      </CardBody>
      <CardFooter>
        <Badge>{resource.status}</Badge>
      </CardFooter>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Resource</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(onUpdate)}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.title}>
                  <FormLabel>Title</FormLabel>
                  <Input {...register('title')} />
                  <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.description}>
                  <FormLabel>Description</FormLabel>
                  <Textarea rows={4} {...register('description')} />
                  <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button type="submit" colorScheme="blue">Save Changes</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Card>
  )
}
\`\`\`
`
  },
}
