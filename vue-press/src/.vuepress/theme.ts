import { hopeTheme, NavbarOptions } from 'vuepress-theme-hope';

import sidebar from './sidebar';

const navbar: NavbarOptions = [
  {
    text: 'Guide',
    link: '/guide/app/',
  },
  {
    text: 'Modules',
    link: '/modules/',
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
