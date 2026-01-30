import { sidebar } from 'vuepress-theme-hope';

export default sidebar({
  '/guide/': [
    {
      text: 'App',
      prefix: '/guide/',
      children: [
        'app/',
        {
          text: 'Authentication',
          link: 'app/docs/msal.md',
        },
        // 'app/getting-started',
        // {
        //   text: 'Cookbooks',
        //   link: 'app/cookbooks.md',
        //   prefix: 'app',
        //   children: [
        //     {
        //       text: 'AG-Grid',
        //       link: 'ag-grid.md',
        //     },
        //   ],
        // },
        // 'app/settings',
        // 'app/feature-flag',
        // 'app/people',
        // 'app/legacy',
        // 'app/tips_and_tricks',
        // 'app/widget',
      ],
    },
    {
      text: 'Portal',
      prefix: '/guide/portal',
      children: ['widget/'],
    },
    {
      text: 'Dev Server',
      link: '/cli/docs/dev-server.md',
    },
    {
      text: 'Cookbooks',
      link: '/cookbooks/index.md',
    }
  ],
  '/cookbooks/': [
    {
      text: 'Cookbooks',
      link: 'index.md',
      children: [
        {
          text: 'React Applications',
          children: [
            {
              text: 'Basic React App',
              link: 'react-app-basic.md',
            },
            {
              text: 'MSAL Authentication',
              link: 'react-app-msal.md',
            },
            {
              text: 'AG Grid',
              link: 'react-app-ag-grid.md',
            },
            {
              text: 'App Loader',
              link: 'react-app-apploader.md',
            },
            {
              text: 'Assets',
              link: 'react-app-assets.md',
            },
            {
              text: 'Bookmarks',
              link: 'react-app-bookmark.md',
            },
            {
              text: 'Advanced Bookmarks',
              link: 'react-app-bookmark-advanced.md',
            },
            {
              text: 'Charts',
              link: 'react-app-charts.md',
            },
            {
              text: 'Context',
              link: 'react-app-context.md',
            },
            {
              text: 'Custom Error Handling',
              link: 'react-app-context-custom-error.md',
            },
            {
              text: 'Environment Variables',
              link: 'react-app-environment-variables.md',
            },
            {
              text: 'Feature Flags',
              link: 'react-app-feature-flag.md',
            },
            {
              text: 'Custom Modules',
              link: 'react-app-module.md',
            },
            {
              text: 'People Service',
              link: 'react-app-people.md',
            },
            {
              text: 'Router',
              link: 'react-app-router.md',
            },
            {
              text: 'Settings',
              link: 'react-app-settings.md',
            },
          ],
        },
        {
          text: 'Other Examples',
          children: [
            {
              text: 'Vanilla JavaScript',
              link: 'app-vanilla.md',
            },
            {
              text: 'Portal',
              link: 'app-portal.md',
            },
            {
              text: 'Portal Analytics',
              link: 'portal-analytics.md',
            },
          ],
        },
      ],
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
      text: 'React',
      prefix: 'react/',
      children: [
        {
          text: 'Router',
          link: 'router/',
        },
      ],
    },
    {
      text: 'Service Discovery',
      link: 'service-discovery/',
    },
    {
      text: 'Telemetry',
      link: 'telemetry/',
    },
    {
      text: 'Analytics',
      link: 'analytics/',
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
