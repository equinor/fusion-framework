import { configureFusionAI } from './packages/cli/src/lib/fusion-ai.js';

export default configureFusionAI(() => {
  return {
    patterns: [
      'packages/**/src/**/*.ts',
      'packages/**/README.md',
      'packages/**/docs/**/*.md',
      '!packages/**/tests',
      '!packages/**/src/__tests__',
      '!packages/**/*.spec.ts',
      '!packages/**/*.test.ts',
      '!packages/cli/src/**/*.ts',
      '!packages/widgets',
    ],
    // metadata: {
    //   attributeProcessor: (metadata) => {
    //     return { ...metadata, foo: 'bar', baz: 'qux' };
    //   },
    // },
  };
});
