import { defineProject } from 'vitest/config';

import { name, version } from './package.json';

export default defineProject({
  test: {
    // TODO remove after __tests__ are deleted!
    include: ['tests/**'],
    name: `${name}@${version}`,
    env: {
      FUSION_LOG_LEVEL: '4', // Set the logging level for Fusion framework
    },
  },
});
