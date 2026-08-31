import { defineUserConfig } from 'vuepress/cli';
import { viteBundler } from '@vuepress/bundler-vite';
import { getDirname, path } from 'vuepress/utils';
import { registerComponentsPlugin } from '@vuepress/plugin-register-components';

const __dirname = getDirname(import.meta.url);

const __repoRoot = path.resolve(__dirname, '../../../');

const { description, name, version } = require('../../../package.json');

import theme from './theme.js';
import { packageNamespaceLinksPlugin } from './plugins/package-namespace-links-plugin.js';

export default defineUserConfig({
  base: (process.env.VUEPRESS_BASE ?? '/fusion-framework/') as '/' | `/${string}/`,
  title: [name, version].join('@'),
  description,
  head: [
    ['link', { href: 'https://cdn.eds.equinor.com/font/equinor-font.css', rel: 'stylesheet' }],
  ],
  theme,
  bundler: viteBundler({
    viteOptions: {
      optimizeDeps: {
        include: ['mermaid'],
      },
    },
    vuePluginOptions: {},
  }),
  plugins: [
    packageNamespaceLinksPlugin(__repoRoot),
    registerComponentsPlugin({
      components: {
        ModuleBadge: path.resolve(__dirname, './components/ModuleBadge.vue'),
        AgGridVersion: path.resolve(__dirname, './components/AgGridVersion.vue'),
      },
    }),
  ],
  markdown: {
    importCode: {
      handleImportPath: (str) => {
        return str
          .replace(/^@cookbooks/, path.resolve(__repoRoot, 'cookbooks'))
          .replace(/^@packages/, path.resolve(__repoRoot, 'packages'));
      },
    },
  },
});
