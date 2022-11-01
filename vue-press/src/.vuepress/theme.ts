import { hopeTheme, HopeThemeNavbarConfig } from "vuepress-theme-hope";

import sidebar from './sidebar';

const navbar: HopeThemeNavbarConfig = [
  {
    text: 'Guide',
    link: '/guide/'
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
      mdEnhance: {
        mermaid: true,
        codetabs: true,
        tabs: true,
        tasklist: true,
        container: true,
      }
     }
});