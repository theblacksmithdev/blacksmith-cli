import type { PromptTemplate } from '../types.js'

export const defaultTemplates: PromptTemplate[] = [
  {
    id: 'add-page',
    name: 'Add a new page',
    description: 'Create a new page with routing and optional auth protection',
    icon: 'Layout',
    category: 'pages',
    fields: [
      { name: 'pageName', label: 'Page name', type: 'text', placeholder: 'e.g. Settings', required: true },
      { name: 'description', label: 'What should this page do?', type: 'textarea', placeholder: 'Describe the page purpose and content...', required: true },
      { name: 'requiresAuth', label: 'Requires authentication?', type: 'select', options: ['Yes', 'No'], required: true },
    ],
    promptTemplate: 'Create a new page called "{{pageName}}". {{description}}. This page {{#if (eq requiresAuth "Yes")}}requires authentication{{else}}is publicly accessible{{/if}}. Follow the existing page structure patterns in the project — create the component, add routing, and any necessary sub-components.',
  },
  {
    id: 'create-resource',
    name: 'Create a resource',
    description: 'Full-stack resource: model, API, serializer, pages, and hooks',
    icon: 'Database',
    category: 'api',
    fields: [
      { name: 'resourceName', label: 'Resource name (singular)', type: 'text', placeholder: 'e.g. BlogPost', required: true },
      { name: 'fields', label: 'Fields (one per line: name:type)', type: 'textarea', placeholder: 'title:string\ncontent:text\npublished:boolean', required: true },
      { name: 'requiresAuth', label: 'Requires authentication?', type: 'select', options: ['Yes', 'No'], required: true },
    ],
    promptTemplate: 'Create a full-stack resource called "{{resourceName}}" with these fields:\n{{fields}}\n\nThis should include: Django model, serializer, viewset, URL routing, React pages (list + detail), API hooks, and form component. {{#if (eq requiresAuth "Yes")}}All endpoints require authentication.{{else}}Endpoints are publicly accessible.{{/if}}',
  },
  {
    id: 'add-endpoint',
    name: 'Add an API endpoint',
    description: 'Create a new Django REST API endpoint',
    icon: 'Zap',
    category: 'api',
    fields: [
      { name: 'endpointPath', label: 'Endpoint path', type: 'text', placeholder: 'e.g. /api/analytics/summary', required: true },
      { name: 'method', label: 'HTTP method', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], required: true },
      { name: 'description', label: 'What should this endpoint do?', type: 'textarea', placeholder: 'Describe the endpoint behavior, request/response format...', required: true },
    ],
    promptTemplate: 'Create a new {{method}} endpoint at {{endpointPath}}. {{description}}. Include the view, URL routing, serializer if needed, and add it to the OpenAPI schema.',
  },
  {
    id: 'fix-bug',
    name: 'Fix a bug',
    description: 'Describe a bug and let Claude investigate and fix it',
    icon: 'Bug',
    category: 'debug',
    fields: [
      { name: 'bugDescription', label: 'What\'s going wrong?', type: 'textarea', placeholder: 'Describe what you expected vs what actually happens...', required: true },
      { name: 'stepsToReproduce', label: 'Steps to reproduce (optional)', type: 'textarea', placeholder: '1. Go to...\n2. Click on...\n3. See error...', required: false },
    ],
    promptTemplate: 'I have a bug that needs fixing.\n\nProblem: {{bugDescription}}\n\n{{#if stepsToReproduce}}Steps to reproduce:\n{{stepsToReproduce}}\n\n{{/if}}Please investigate the issue, find the root cause, and fix it.',
  },
  {
    id: 'add-component',
    name: 'Add a component',
    description: 'Create a new reusable React component',
    icon: 'Component',
    category: 'pages',
    fields: [
      { name: 'componentName', label: 'Component name', type: 'text', placeholder: 'e.g. UserProfileCard', required: true },
      { name: 'description', label: 'What should this component do?', type: 'textarea', placeholder: 'Describe the component, its props, and behavior...', required: true },
      { name: 'location', label: 'Where should it live?', type: 'text', placeholder: 'e.g. src/shared/components', required: false },
    ],
    promptTemplate: 'Create a new React component called "{{componentName}}". {{description}}.{{#if location}} Place it in {{location}}.{{/if}} Use Chakra UI for styling and follow the existing component patterns in the project.',
  },
  {
    id: 'refactor',
    name: 'Refactor code',
    description: 'Improve existing code structure or quality',
    icon: 'RefreshCw',
    category: 'general',
    fields: [
      { name: 'targetFile', label: 'File or area to refactor', type: 'text', placeholder: 'e.g. src/pages/dashboard/dashboard.tsx', required: true },
      { name: 'description', label: 'What should be improved?', type: 'textarea', placeholder: 'Describe what you want to change and why...', required: true },
    ],
    promptTemplate: 'Refactor {{targetFile}}. {{description}}. Keep the existing behavior intact while improving the code quality.',
  },
  {
    id: 'write-tests',
    name: 'Write tests',
    description: 'Add tests for existing code',
    icon: 'TestTube',
    category: 'debug',
    fields: [
      { name: 'targetFile', label: 'File to test', type: 'text', placeholder: 'e.g. src/pages/customers/customers-page.tsx', required: true },
      { name: 'testType', label: 'Test type', type: 'select', options: ['Unit tests', 'Integration tests', 'Both'], required: true },
    ],
    promptTemplate: 'Write {{testType}} for {{targetFile}}. Follow the existing testing patterns in the project (Vitest, Testing Library). Cover the main use cases and edge cases.',
  },
  {
    id: 'general-task',
    name: 'General task',
    description: 'Describe anything you want to build or change',
    icon: 'Sparkles',
    category: 'general',
    fields: [
      { name: 'description', label: 'What do you want to do?', type: 'textarea', placeholder: 'Describe what you want to build, change, or fix in detail...', required: true },
    ],
    promptTemplate: '{{description}}',
  },
]

export function getTemplates(): PromptTemplate[] {
  return defaultTemplates
}

export function interpolateTemplate(template: PromptTemplate, values: Record<string, string>): string {
  let result = template.promptTemplate

  // Simple interpolation: replace {{fieldName}} with values
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }

  // Handle simple conditionals: {{#if fieldName}}...{{/if}}
  result = result.replace(
    /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, field, content) => (values[field] ? content : ''),
  )

  // Handle eq helper: {{#if (eq field "value")}}...{{else}}...{{/if}}
  result = result.replace(
    /\{\{#if\s+\(eq\s+(\w+)\s+"([^"]+)"\)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, field, expected, ifContent, elseContent) =>
      values[field] === expected ? ifContent : elseContent,
  )

  return result.trim()
}
