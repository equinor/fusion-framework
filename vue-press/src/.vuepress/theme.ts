import { hopeTheme, NavbarOptions } from "vuepress-theme-hope";

import sidebar from './sidebar';

const navbar: NavbarOptions = [
  {
    text: 'Guide',
    link: '/guide/app'
  },
  {
    text: 'Modules',
    link: '/modules/'
  },
  {
    text: 'Roadmap',
    link: '/roadmap/'
  },
];

export default hopeTheme({
     logo: '/fusion.svg',
     repo: 'equinor/fusion-framework',
     docsBranch: 'main',
     docsDir: "vue-press/src",
     darkmode: "switch",
     navbar,
     sidebar,
     plugins:{
      blog: true,
      mdEnhance: {
        mermaid: true,
        codetabs: true,
        tabs: true,
        tasklist: true,
        hint: true,
        imgSize: true,
        align: true,
        gfm: true,
        include: true,
      },
      comment: {
        provider: "Giscus",
        repo: 'equinor/fusion-framework',
        repoId: "MDEwOlJlcG9zaXRvcnkzNzEyODUwMzk=",
        category: "Documentation",
        categoryId: "DIC_kwDOFiFcL84CSoOm",
      },
     }
});