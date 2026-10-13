import type { Skill, SkillContext } from './types.js'

export const nuxtUiFormsSkill: Skill = {
  id: 'nuxt-ui-forms',
  name: 'Nuxt UI Forms',
  description: 'Forms with Nuxt UI v4 (UForm + UFormField) and Zod: validation, submission, and server field errors.',

  render(_ctx: SkillContext): string {
    return `## Nuxt UI Forms — UForm + UFormField + Zod

> **RULE: Every form is a \`UForm\` with a Zod \`schema\` and a \`reactive\` state, and every field is a \`UFormField\`.**
> Never build forms from raw \`<form>\`, \`<label>\`, \`<input>\` or hand-written error text.

\`\`\`vue
<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import UButton from '@nuxt/ui/components/Button.vue'
import UForm from '@nuxt/ui/components/Form.vue'
import UFormField from '@nuxt/ui/components/FormField.vue'
import UInput from '@nuxt/ui/components/Input.vue'
</script>
\`\`\`

### Components

- \`UForm\` — \`:schema\` (Zod), \`:state\` (a \`reactive\` object), \`@submit\` (fires only when the schema passes, with \`event.data\` typed by the schema). Exposes \`setErrors\`, \`clear\`, \`validate\` through a template ref
- \`UFormField\` — \`label\`, \`name\` (must match the schema key — that is how errors reach the field), \`required\` (asterisk), \`description\`, \`hint\`, \`help\`
- Inputs inside: \`UInput\`, \`UTextarea\`, \`USelect\`, \`USelectMenu\`, \`UCheckbox\`, \`URadioGroup\`, \`USwitch\`, \`UInputNumber\`, \`UPinInput\`, \`UInputDate\` — all bound with \`v-model\` to the state
- Give inputs \`class="w-full"\`; the auth pages use \`size="lg"\`
- Submit with \`<UButton type="submit" :loading="isSubmitting">\`

### Schemas Live Beside the Form, Not In It

- Feature-wide: \`src/features/auth/schemas.ts\` (\`loginSchema\`, \`registerSchema\`, …)
- Per resource: \`src/pages/<resource>/schemas.ts\` exports the schema **and** its type:

\`\`\`ts
import { z } from 'zod'

export const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string(),
})

export type PostFormData = z.infer<typeof postSchema>
\`\`\`

Pages and dialogs import \`PostFormData\` from there — one owner for the form's shape.

### Server Errors Show Under the Same Fields

The backend validates again and answers with DRF field errors (\`{ "title": ["This field is required."] }\`). \`useApiMutation\` exposes them as \`fieldErrors\`; \`toFormErrors\` (\`@/shared/utils/form-errors\`) turns them into \`UForm\` errors:

\`\`\`ts
import { useTemplateRef, watch } from 'vue'
import { toFormErrors } from '@/shared/utils/form-errors'

const form = useTemplateRef('form')

// Server-side errors show under their fields, as client-side ones do
watch(
  () => props.fieldErrors,
  (errors) => form.value?.setErrors(toFormErrors(errors)),
)
\`\`\`

The request-level message (\`errorMessage\`) goes in a \`StatusAlert\` at the top of the form.

### Rules
- \`name\` on \`UFormField\` always equals the schema key
- Never \`try/catch\` around a submit to build error state — errors come from the mutation (\`errorMessage\`, \`fieldErrors\`)
- Forms are presentational: they take \`defaultValues\`, \`isSubmitting\`, \`errorMessage\`, \`fieldErrors\` as props and emit \`submit\` with the parsed data. The page owns the mutation
- Seed the state once from \`defaultValues\` (the form remounts each time its dialog opens); the line carries \`// eslint-disable-next-line vue/no-setup-props-reactivity-loss\` because reading the prop once is the intent
- Disable nothing by hand while submitting — \`:loading\` on the submit button is enough

### Form Pattern — ALWAYS follow this (\`components/PostForm.vue\`)

\`\`\`vue
<script setup lang="ts">
import { reactive, useTemplateRef, watch } from 'vue'
import type { FormSubmitEvent } from '@nuxt/ui'
import UButton from '@nuxt/ui/components/Button.vue'
import UForm from '@nuxt/ui/components/Form.vue'
import UFormField from '@nuxt/ui/components/FormField.vue'
import UInput from '@nuxt/ui/components/Input.vue'
import UTextarea from '@nuxt/ui/components/Textarea.vue'
import StatusAlert from '@/shared/components/StatusAlert.vue'
import { toFormErrors } from '@/shared/utils/form-errors'
import { postSchema, type PostFormData } from '../schemas'

const props = withDefaults(defineProps<{
  defaultValues?: Partial<PostFormData>
  isSubmitting?: boolean
  errorMessage?: string | null
  fieldErrors?: Record<string, string[]>
}>(), {
  defaultValues: () => ({}),
  errorMessage: null,
  fieldErrors: () => ({}),
})

const emit = defineEmits<{
  submit: [data: PostFormData]
}>()

// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const state = reactive<PostFormData>({ title: '', description: '', ...props.defaultValues })

const form = useTemplateRef('form')

watch(
  () => props.fieldErrors,
  (errors) => form.value?.setErrors(toFormErrors(errors)),
)

function onSubmit(event: FormSubmitEvent<PostFormData>) {
  emit('submit', event.data)
}
</script>

<template>
  <UForm
    ref="form"
    :schema="postSchema"
    :state="state"
    class="flex flex-col gap-5"
    @submit="onSubmit"
  >
    <StatusAlert v-if="errorMessage" :message="errorMessage" />

    <UFormField label="Title" name="title" required>
      <UInput v-model="state.title" class="w-full" />
    </UFormField>

    <UFormField label="Description" name="description">
      <UTextarea v-model="state.description" :rows="4" class="w-full" />
    </UFormField>

    <UButton type="submit" :loading="isSubmitting" class="self-start">
      Save
    </UButton>
  </UForm>
</template>
\`\`\`

### Example: Create in a Modal (the page owns the mutation)

\`\`\`vue
<script setup lang="ts">
import { ref } from 'vue'
import UButton from '@nuxt/ui/components/Button.vue'
import UModal from '@nuxt/ui/components/Modal.vue'
import { useCreatePost } from '@/api/composables/posts'
import PostForm from './components/PostForm.vue'
import type { PostFormData } from './schemas'

const creating = ref(false)
const {
  mutate: createPost,
  isPending: isCreating,
  errorMessage: createError,
  fieldErrors: createFieldErrors,
  reset: resetCreate,
} = useCreatePost()

function openCreate() {
  resetCreate() // a reopened form starts without the last attempt's errors
  creating.value = true
}

function onCreate(body: PostFormData) {
  createPost({ body }, { onSuccess: () => (creating.value = false) })
}
</script>

<template>
  <UButton icon="i-lucide-plus" @click="openCreate">
    New post
  </UButton>

  <UModal v-model:open="creating" title="New post">
    <template #body>
      <PostForm
        :is-submitting="isCreating"
        :error-message="createError"
        :field-errors="createFieldErrors"
        @submit="onCreate"
      />
    </template>
  </UModal>
</template>
\`\`\`

Destructure the mutation's refs (\`mutate\`, \`isPending\`, \`errorMessage\`, …) in \`<script setup>\`: top-level refs unwrap in the template, while a ref nested in the returned object (\`mutation.isPending\`) would need \`.value\`. Editing works the same way with \`useUpdatePost(() => props.id)\` and \`:default-values\`.
`
  },
}
