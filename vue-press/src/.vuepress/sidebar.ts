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
