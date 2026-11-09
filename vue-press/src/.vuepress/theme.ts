import { hopeTheme, NavbarOptions } from 'vuepress-theme-hope';

import sidebar from './sidebar';
import { THIRD_PARTY_NOTICES_FILE } from './plugins/third-party-notices-plugin.js';
import { siteBase } from './site-base.js';

const navbar: NavbarOptions = [
  {
    text: 'Guide',
    link: '/guide/app/',
  },
  {
    text: 'Cookbooks',
    link: '/cookbooks/',
  },
  {
    text: 'Modules',
    link: '/modules/',
  },
  {
    text: 'Plugins',
    link: '/plugins/',
  },
  {
    text: 'CLI',
    link: '/cli/',
  },
  {
    text: 'Contributing',
    link: '/contributing/',
  }
];

export default hopeTheme({
  logo: '/fusion.svg',
  repo: 'equinor/fusion-framework',
  docsBranch: 'main',
  docsDir: 'vue-press/src',
  darkmode: 'switch',
  navbar,
  sidebar,
  // The theme renders the footer as raw HTML, so the link needs the site base.
  footer: `Powered by Fusion · <a href="${siteBase}${THIRD_PARTY_NOTICES_FILE}">Third-party licenses</a>`,
  displayFooter: true,
  markdown: {
    gfm: true,
    alert: true,
    mermaid: true,
    tabs: true,
    codeTabs: true
  },
  plugins: {
    blog: true,
    comment: {
      provider: 'Giscus',
      repo: 'equinor/fusion-framework',
      repoId: 'MDEwOlJlcG9zaXRvcnkzNzEyODUwMzk=',
      category: 'Documentation',
      categoryId: 'DIC_kwDOFiFcL84CSoOm',
    },
  },
});
