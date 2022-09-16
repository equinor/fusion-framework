import { sidebar } from "vuepress-theme-hope";

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
      ]
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
      ]
    }
  ]
});