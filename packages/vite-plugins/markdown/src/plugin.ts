import type { Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

/**
 * Options for configuring the markdown plugin.
 */
export type MarkdownPluginOptions = {
  /**
   * Whether to include markdown files as assets.
   * @default true
   */
  assetsInclude?: boolean;
};

/**
 * Creates a Vite plugin that handles markdown file imports with ?raw query parameter.
 *
 * This plugin transforms imports like `import content from './README.md?raw'` into
 * a module that exports the raw markdown content as a string.
 *
 * @param options - Optional configuration for the plugin
 * @returns A Vite plugin instance
 */
export const markdownPlugin = (options: MarkdownPluginOptions = {}): Plugin => {
  const { assetsInclude = true } = options;

  return {
    name: 'fusion-framework-vite-plugin-markdown',
    enforce: 'pre', // Run before other plugins
    resolveId(id, importer) {
      // Handle .md?raw imports - create a virtual module ID
      if (id.includes('.md') && id.includes('?raw')) {
        const filePath = id.split('?')[0];
        // Resolve to absolute path if relative
        const resolvedPath = importer && !filePath.startsWith('/') && !filePath.startsWith(process.cwd())
          ? resolve(dirname(importer), filePath)
          : filePath.startsWith('/')
            ? filePath
            : resolve(process.cwd(), filePath);
        // Return virtual module ID with \0 prefix (Vite convention for virtual modules)
        return `\0markdown:${resolvedPath}`;
      }
      return null;
    },
    load(id) {
      // Handle our virtual markdown modules
      if (id.startsWith('\0markdown:')) {
        const filePath = id.slice('\0markdown:'.length);
        
        // Read the file synchronously
        try {
          const content = readFileSync(filePath, 'utf-8');
          // Return the raw content as a default export
          return `export default ${JSON.stringify(content)};`;
        } catch (error) {
          // If file can't be read, return null to let other plugins handle it
          return null;
        }
      }
      
      return null;
    },
    transform(code, id) {
      // Handle .md files without ?raw (fallback for cases where load didn't catch it)
      const idWithoutQuery = id.split('?')[0];
      
      if (idWithoutQuery.endsWith('.md') && !id.includes('?raw')) {
        // Return the raw content as a default export
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: null,
        };
      }
      
      return null;
    },
    // Include markdown files as assets if configured
    ...(assetsInclude && {
      assetsInclude: ['**/*.md'],
    }),
  };
};

export default markdownPlugin;

