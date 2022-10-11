import { sidebar } from 'vuepress-theme-hope';

export default sidebar({
    '/guide/': [
        {
            text: 'App',
            prefix: '/guide/',
            children: [
                'app/',
                'app/getting-started',
                'app/app-modules',
                'app/add-modules',
                'app/legacy',
            ],
        },
    ],
    '/modules/': [
        {
            text: 'Modules',
            prefix: '/modules/',
            children: [
                '',
                'http/',
                'event/',
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
