import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'introduction',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/prerequisites',
      ],
    },
    {
      type: 'category',
      label: 'CLI Commands',
      items: [
        'commands/init',
        'commands/dev',
        'commands/sync',
        'commands/make-resource',
        'commands/build',
        'commands/eject',
        'commands/setup-ai',
        'commands/backend',
        'commands/frontend',
        'commands/skills',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/project-structure',
        'guides/openapi-sync',
        'guides/authentication',
        'guides/creating-resources',
        'guides/ai-development',
        'guides/deployment',
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      items: [
        'configuration/project-config',
        'configuration/theme-colors',
      ],
    },
    {
      type: 'category',
      label: 'Technology Stack',
      items: [
        'stack/backend',
        'stack/frontend',
      ],
    },
  ],
};

export default sidebars;
