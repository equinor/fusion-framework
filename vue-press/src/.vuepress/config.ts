import { defineUserConfig } from "vuepress";
import { getDirname, path } from '@vuepress/utils'
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'

const __dirname = getDirname(import.meta.url);

const __repoRoot = path.resolve(__dirname, '../../../');

const { description, name, version } = require('../../../package.json');

import theme from './theme';

import { commentPlugin } from "vuepress-plugin-comment2";

export default defineUserConfig({
  base: '/fusion-framework/',
  title: [name, version].join('@'),
  description,
  theme,
  plugins: [
    registerComponentsPlugin({
      components: {
        ModuleBadge: path.resolve(__dirname, './components/ModuleBadge.vue'),
      }
    }),
    commentPlugin({
      provider: "Giscus",
      repo: 'equinor/fusion-framework',
      repoId: "MDEwOlJlcG9zaXRvcnkzNzEyODUwMzk=",
      category: "Documentation",
      categoryId: "DIC_kwDOFiFcL84CSoOm",
    })
  ],
  markdown: {
    code: {
      lineNumbers: false,
    },
    importCode: {
      handleImportPath: (str) => {
        return str.replace(/^@cookbooks/, path.resolve(__repoRoot, 'cookbooks'));
      }
    }
  }
});

