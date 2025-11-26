export default {
  index: {
    ignore: ['node_modules/**', 'dist/**', '**/node_modules/**', '**/dist/**'],
    // File patterns to match for processing
    patterns: [
      'packages/**/src/**/*.{ts,tsx}',
      'cookbooks/**/*.{ts,tsx}',
      // doccs
      'packages/**/docs/**/*.md',
      'packages/**/README.md',
      //
      '!packages/cli-plugins/**',
    ],
    rawPatterns: ['cookbooks/**/*.{ts,tsx}'],
    // Metadata processing configuration
    metadata: {
      // Optional: Custom metadata processor to transform metadata before embedding
      attributeProcessor: (metadata, document) => {
        const source = document.metadata.source;
        // Transform or filter metadata attributes
        metadata.tags ??= [];
        if (source.includes('packages/')) {
          metadata.tags.push('package');
        }
        if (source.includes('packages/react/')) {
          metadata.tags.push('react');
        }
        if (source.includes('packages/react/app')) {
          metadata.tags.push('app');
        }
        if (source.includes('packages/modules/')) {
          metadata.tags.push('module');
        }
        if (source.includes('packages/utils/')) {
          metadata.tags.push('utils');
        }
        if (source.includes('packages/cli/')) {
          metadata.tags.push('cli', 'node');
        }
        if (source.includes('cookbooks/')) {
          metadata.tags.push('cookbook', 'examples', 'howtos', 'tutorials', 'guides');
        }
        if (source.includes('CHANGELOG.md')) {
          metadata.tags.push('changelog', 'release notes');
        }
        return metadata;
      },
      resolvePackage: true,
    },
  },
};
