import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Blacksmith CLI',
  tagline: 'Forge fullstack Django + React applications in seconds',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://blacksmith-cli.dev',
  baseUrl: '/',

  organizationName: 'blacksmith-cli',
  projectName: 'blacksmith-cli',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/oluwatobimaxwell/blacksmith-cli/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Blacksmith CLI',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/oluwatobimaxwell/blacksmith-cli',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started/installation',
            },
            {
              label: 'CLI Commands',
              to: '/docs/commands/init',
            },
            {
              label: 'Guides',
              to: '/docs/guides/project-structure',
            },
          ],
        },
        {
          title: 'Stack',
          items: [
            {
              label: 'Django',
              href: 'https://www.djangoproject.com/',
            },
            {
              label: 'React',
              href: 'https://react.dev/',
            },
            {
              label: 'Vite',
              href: 'https://vite.dev/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/oluwatobimaxwell/blacksmith-cli',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/blacksmith-cli',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Blacksmith CLI. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'python', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
