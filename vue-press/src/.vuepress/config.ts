import { defineUserConfig } from "vuepress";
import { getDirname, path } from '@vuepress/utils'
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'

const __dirname = getDirname(import.meta.url);

const { description, name, version } = require('../../../package.json');

import theme from './theme';

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
    })
  ],
  markdown: {
    code: {
      lineNumbers: false,
    }
  }
});

