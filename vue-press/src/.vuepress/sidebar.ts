import { sidebar } from 'vuepress-theme-hope';

export default sidebar({
    '/guide/': [
        {
            text: 'App',
            prefix: '/guide/',
            children: [
                'app/',
                'app/getting-started',
                'app/cli',
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
            text: 'App',
            link: 'docs/app.md',
            prefix: 'docs/',
            children: [
                {
                    text: 'configuration',
                    link: 'app-config.md',
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
