import { defineConfig } from 'vuepress/config';
const { description, name, version } = require('../../package')

export default defineConfig({
  base: '/fusion-framework/',
  title: [name, version].join('@'),
  description,
  plugins: [
    '@vuepress/plugin-last-updated',
    'vuepress-plugin-mermaidjs',
  ],
  themeConfig: {
    repo: 'equinor/fusion-framework',
    editLinks: true,
    docsDir: "packages/docs/docs",
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
        link: '/tags/'
      },
    ],
    sidebar: {
      '/modules/': [
        {
          title: 'Modules',
          collapsable: true,
          sidebarDepth: 3,
          children: [
            '',
            'event/',
          ]
        }
      ],
    }
  }
})

// module.exports = {
//   /**
//    * Ref：https://v1.vuepress.vuejs.org/config/#title
//    */
//   title: 'Vuepress Docs Boilerplate',
//   /**
//    * Ref：https://v1.vuepress.vuejs.org/config/#description
//    */
//   description: description,

//   /**
//    * Extra tags to be injected to the page HTML `<head>`
//    *
//    * ref：https://v1.vuepress.vuejs.org/config/#head
//    */
//   head: [
//     ['meta', { name: 'theme-color', content: '#3eaf7c' }],
//     ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
//     ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
//   ],

//   /**
//    * Theme configuration, here is the default theme configuration for VuePress.
//    *
//    * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
//    */
//   themeConfig: {
//     repo: '',
//     editLinks: false,
//     docsDir: '',
//     editLinkText: '',
//     lastUpdated: false,
//     nav: [
//       {
//         text: 'Modules',
//         link: '/modules/'
//       },
//     ],
//     sidebar: {
//       '/modules/': [
//         {
//           title: 'Modules',
//           collapsable: false,
//           children: [
//             '',
//             'using-vue',
//           ]
//         }
//       ],
//     }
//   },

//   /**
//    * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
//    */
//   plugins: [
//     '@vuepress/plugin-back-to-top',
//     '@vuepress/plugin-medium-zoom',
//     'vuepress-plugin-mermaidjs'
//   ]
// }
