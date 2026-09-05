import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';

import { name, version } from './package.json' with { type: 'json' };

export default defineProject({
  test: {
    name: `${name}@${version}`,
  },
});
