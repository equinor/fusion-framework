export default {
  index: {
    name: 'eds-2026-03-14',
    model: 'text-embedding-3-large',
    // File patterns to match for processing
    patterns: [
      '**/*.md',
      // Exclude boilerplate endpoint/parameter generators that produce low-value embeddings
      '!**/docs/README.md',
      '!**/docs/about',
      '!**/docs/resources',
      '!**/docs/tone-guide',
    ],
    rawPatterns: ['**/*.md'],
    // Metadata processing configuration
    metadata: {
      resolvePackage: false,
      resolveGit: false,
    },
  },
};
