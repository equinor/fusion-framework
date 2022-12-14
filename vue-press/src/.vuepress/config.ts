import { defineUserConfig } from "vuepress";
import { getDirname, path } from '@vuepress/utils'
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'

const __dirname = getDirname(import.meta.url);

const __repoRoot = path.resolve(__dirname, '../../../');

const { description, name, version } = require('../../../package.json');

import theme from './theme';

export default defineUserConfig({
  base: '/fusion-framework/',
  title: [name, version].join('@'),
  description,
  head: [
    ["link", { href:"https://eds-static.equinor.com/font/equinor-font.css", rel:"stylesheet"}]
  ],
  theme,
  plugins: [
    registerComponentsPlugin({
      components: {
        ModuleBadge: path.resolve(__dirname, './components/ModuleBadge.vue'),
      }
    })
  ],
  markdown: {
    code: {
      lineNumbers: false,
    },
    importCode: {
      handleImportPath: (str) => {
        return str.replace(/^@cookbooks/, path.resolve(__repoRoot, 'cookbooks')).replace(/^@packages/, path.resolve(__repoRoot, 'packages'));
      }
    }
  }
});

