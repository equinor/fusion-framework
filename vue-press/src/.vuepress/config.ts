import hope from "vuepress-theme-hope";
const { description, name, version } = require('../../../package.json')

export default hope.config({
  base: '/fusion-framework/',
  title: [name, version].join('@'),
  description,
  themeConfig: {
    logo: '/fusion.svg',
    repo: 'equinor/fusion-framework',
    docsBranch: 'main',
    editLinks: true,
    docsDir: "vue-press/src",
    darkmode: 'auto-switch',
    comment: false,
    nav: [
      {
        text: 'Guide',
        link: '/guide/'
      },
      {
        text: 'Modules',
        link: '/modules/'
      },
      {
        text: 'Tags',
        link: '/tag/'
      },
    ],
    sidebar: {
      '/guide/': [
        {
          title: 'App',
          collapsable: true,
          sidebarDepth: 3,
          children: [
            'app/',
            'app/getting-started',
            'app/app-modules',
            'app/add-modules',
            'app/legacy',
          ]
        },
        {
          title: 'Portal',
          collapsable: true,
          sidebarDepth: 3,
          children: [
            'portal/',
          ]
        }
      ],
      '/modules/': [
        {
          title: 'Modules',
          collapsable: true,
          sidebarDepth: 3,
          children: [
            '',
            'http/',
            'event/',
            'ag-grid/',
          ]
        }
      ],
    },
    mdEnhance: {
      // enableAll: true,
      mermaid: true,
      codegroup: true,
      container: true,
      presentation: {
        plugins: [
          "highlight",
          "math",
          "search",
          "notes",
          "zoom",
          "anything",
          "audio",
          "chalkboard",
        ],
      },
    }
  },
})