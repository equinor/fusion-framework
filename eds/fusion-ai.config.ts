export default {
  index: {
    name: 'eds-2026-03-14',
    model: 'text-embedding-3-large',
    // File patterns to match for processing
    patterns: [
      'eds/output/**/*.md',
      // Exclude boilerplate endpoint/parameter generators that produce low-value
      '!eds/output/docs/README.md',
      '!eds/output/docs/about',
      '!eds/output/docs/resources',
      '!eds/output/docs/tone-guide',
    ],
    rawPatterns: ['eds/**/*.md'],
    // Metadata processing configuration
    metadata: {
      resolvePackage: false,
			resolveGit: false,
    },
  },
};
