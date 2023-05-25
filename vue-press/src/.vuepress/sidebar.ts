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
                'app/cookbooks',
                'app/authentication',
                'app/legacy',
                'app/tips_and_tricks'
            ],
        },
    ],
    '/modules/': [
        {
            text: 'Modules',
            prefix: '/modules/',
            children: [
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
                'event/',
                'navigation/',
                'bookmark/',
                'ag-grid/',
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
        },
    ],
});
