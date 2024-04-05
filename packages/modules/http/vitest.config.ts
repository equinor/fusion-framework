import { defineProject } from 'vitest/config';

import { name, version } from './package.json';

export default defineProject({
    test: {
        // TODO remove after __tests__ are deleted!
        include: ['tests/**'],
        name: `${name}@${version}`,
        environment: 'happy-dom',
    },
});
