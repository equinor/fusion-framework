import { sidebar } from 'vuepress-theme-hope';

export default sidebar({
  '/guide/': [
    {
      text: 'App',
      prefix: '/guide/',
      children: [
        'app/',
        'app/getting-started',
        {
          text: 'Cookbooks',
          link: 'app/cookbooks.md',
          prefix: 'app',
          children: [
            {
              text: 'AG-Grid',
              link: 'ag-grid.md',
            },
          ],
        },
        'app/settings',
        'app/feature-flag',
        'app/people',
        'app/authentication',
        'app/legacy',
        'app/tips_and_tricks',
        'app/widget',
      ],
    },
    {
      text: 'Portal',
      prefix: '/guide/portal',
      children: ['widget/'],
    },
  ],
  '/cli/': [
    {
      text: 'CLI',
      link: 'README.md',
      children: [
        {
          text: 'Creating Apps',
          link: 'docs/creating-apps.md',
        },
        {
          text: 'Authentication',
          link: 'docs/auth.md',
        },
        {
          text: 'Application',
          link: 'docs/application.md',
        },
        {
          text: 'Portal',
          link: 'docs/portal.md',
        },
        {
          text: 'Dev Server',
          prefix: 'docs/',
          children: [
            {
              text: 'Overview',
              link: 'dev-server.md',
            },
            {
              text: 'Configuration',
              link: 'dev-server-config.md',
            },
          ],
        },
        {
          text: 'Migration',
          children: [
            {
              text: 'v10 to v11',
              link: 'docs/migration-v10-to-v11.md',
            }
          ]
        }
      ],
    },
  ],
  '/contributing/': [
    {
      text: 'Contributing',
      link: 'README.md',
      children: [
        {
          text: 'Development',
          children: [
            {
              text: 'Getting Started',
              link: 'development.md',
            },
            {
              text: 'Code Standards',
              link: 'code-standards.md',
            },
            {
              text: 'Git Workflow',
              link: 'git-workflow.md',
            },
          ],
        },
        {
          text: 'Code Quality',
          children: [
            {
              text: 'Conventional Commits',
              link: 'conventional-commits.md',
            },
            {
              text: 'Changesets',
              link: 'changeset.md',
            },
            {
              text: 'Self Review',
              link: 'self-review.md',
            },
          ],
        },
        {
          text: 'Process',
          children: [
            {
              text: 'Code Review',
              link: 'reviewing.md',
            },
            {
              text: 'Cookbooks',
              link: 'cookbooks.md',
            },
            {
              text: 'Documentation',
              link: 'documentation.md',
            },
          ],
        },
      ],
    },
  ],
  '/modules/': [
    '',
    {
      text: 'HTTP',
      link: 'http/',
    },
    {
      text: 'Context',
      link: 'context/',
    },
    {
      text: 'Authentication',
      prefix: 'auth/',
      children: [
        {
          text: 'Browser',
          link: 'msal/',
        },
        {
          text: 'NodeJS',
          link: 'msal-node/',
        },
      ],
    },
    'app/',
    {
      text: 'Event',
      prefix: 'event/',
      link: 'event/',
      children: [
        {
          text: 'module',
          link: 'README.md',
        },
        {
          text: 'React',
          link: 'react.md',
        },
      ],
    },
    {
      text: 'Feature flag',
      prefix: 'feature-flag/',
      link: 'feature-flag/module.md',
      children: [
        {
          text: 'module',
          link: 'module.md',
        },
        {
          text: 'react',
          link: 'react.md',
        },
      ],
    },
    'navigation/',
    'bookmark/',
    'ag-grid/',
    'widget/',
    {
      text: 'Service Discovery',
      link: 'service-discovery/',
    },
    {
      text: 'Telemetry',
      link: 'telemetry/',
    },
    {
      text: 'Services',
      prefix: 'services/',
      link: 'services/',
      children: [
        {
          text: 'module',
          link: 'README.md',
        },
        {
          text: 'context',
          link: 'context.md',
        },
        {
          text: 'bookmarks',
          link: 'bookmarks.md',
        },
      ],
    },
  ],
});
