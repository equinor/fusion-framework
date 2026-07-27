// Rich object-format fixture (JS so esbuild cache key differs from .ts fixtures).
// Tests that `normalise` correctly extracts `rules`, `customRules`, and `ignorePatterns`.
export default {
  rules: { 'require-tsdoc': 'error', 'require-intent-comment': 'warn' },
  customRules: [
    {
      id: 'custom-fixture-rule',
      defaultSeverity: 'warn',
      check: (_source, _filePath) => [],
    },
  ],
  ignorePatterns: ['**/__tests__/**'],
};
