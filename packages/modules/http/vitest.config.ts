import { defineProject } from 'vitest/config';

import { name, version } from './package.json' with { type: 'json' };

export default defineProject({
  test: {
    // TODO(#5142): remove after __tests__ are deleted!
    include: ['tests/**'],
    name: `${name}@${version}`,
    environment: 'happy-dom',
  },
});
