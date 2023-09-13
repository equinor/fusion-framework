import { defineProject } from 'vitest/config';

import { name, version } from './package.json';

export default defineProject({
    test: {
        include: ['tests/**'],
        name: `${name}@${version}`,
        environment: 'happy-dom',
    },
});
