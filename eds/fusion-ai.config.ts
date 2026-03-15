export default {
  index: {
    name: 'eds-2026-03-14',
    model: 'text-embedding-3-large',
    // eds-content is a gitignored build artifact — must opt out of gitignore filtering
    gitignore: false,
    // File patterns to match for processing
    rawPatterns: ['**/stories/*.md', '**/tokens/*.md'],
    // Metadata processing configuration
    metadata: {
      resolvePackage: false,
      resolveGit: false,
      attributeProcessor: (metadata, document) => {
        const source = document.metadata.source;
        const tags: string[] = ['eds', 'equinor-design-system'];

        // Tag stories by component category derived from filename prefix
        if (source.includes('/stories/')) {
          tags.push('component', 'storybook', 'props', 'api');
          const filename = source.split('/').pop() ?? '';
          if (filename.startsWith('data-display-')) tags.push('data-display');
          if (filename.startsWith('feedback-')) tags.push('feedback');
          if (filename.startsWith('inputs-')) tags.push('inputs');
          if (filename.startsWith('navigation-')) tags.push('navigation');
          if (filename.startsWith('surfaces-')) tags.push('surfaces');
          if (filename.startsWith('icons-')) tags.push('icons');
          if (filename.startsWith('typography-')) tags.push('typography');
        }

        // Tag docs by folder
        if (source.includes('/docs/')) {
          tags.push('documentation');
          if (source.includes('/foundation/')) tags.push('foundation', 'design-tokens');
          if (source.includes('/components/')) tags.push('component');
        }

        // Tag token reference files
        if (source.includes('/tokens/')) {
          tags.push('design-tokens', 'css-variables', 'reference');
          if (source.includes('color-')) tags.push('color');
          if (source.includes('spacing-')) tags.push('spacing');
          if (source.includes('icons')) tags.push('icons');
        }

        metadata.tags = tags;
        return metadata;
      },
    },
  },
};
