import { reactRouterPlugin } from '@equinor/fusion-framework-react-router/vite-plugin';
import { rawImportsPlugin } from '@equinor/fusion-framework-vite-plugin-raw-imports';
import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';

import { name, version } from './package.json' with { type: 'json' };

// the file-route DSL (layout/index/route/prefix) renders blank, and the README's `?raw`
// import fails to parse, without these plugins
export default defineProject({
  plugins: [reactRouterPlugin(), rawImportsPlugin({ extensions: ['.md'] })],
  test: { name: `${name}@${version}` },
});
