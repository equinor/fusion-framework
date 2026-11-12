import { defineProject } from 'vitest/config';
import pkg from './package.json' with { type: 'json' };

export default defineProject({
  test: { include: ['src/__tests__/**/*.test.ts'], name: `${pkg.name}@${pkg.version}` },
});
