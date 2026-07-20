import type { Plugin } from 'vite';
import { resolve, dirname, relative } from 'node:path';

/**
 * Options for configuring the routes DSL plugin.
 */
export type RoutesDslPluginOptions = {
  /**
   * Whether to transform import.meta.resolve() calls.
   * When true, transforms to relative paths that Vite can compile.
   * @default true
   */
  transformResolve?: boolean;
};

/**
 * Transforms import.meta.resolve() calls to relative paths.
 * Also adds static imports to ensure Vite compiles these files.
 * @param code - The code to transform
 * @param filePath - The absolute path of the file being transformed
 * @param root - The Vite root directory
 * @param routeFiles - Set to track route files for build inclusion
 * @returns The transformed code with static imports added
 */
function transformImportMetaResolve(
  code: string,
  filePath: string,
  root: string,
  routeFiles: Set<string>,
): string {
  const fileDir = dirname(filePath);
  const imports: string[] = [];

  const transformedCode = code.replace(
    /import\.meta\.resolve\((['"`])([^'"`]+)\1\)/g,
    (match: string, quote: string, specifier: string) => {
      try {
        // Only resolve relative paths (./ or ../), skip package imports
        if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
          return match;
        }

        // Resolve the absolute path and track it
        const resolvedPath = resolve(fileDir, specifier);
        routeFiles.add(resolvedPath);

        // Add a static import that Vite can analyze
        // This ensures the file is compiled and included in the bundle
        // We use a comment marker so it can be identified
        imports.push(`/* @route-file-import */ import(${quote}${specifier}${quote});`);

        // Keep relative paths as-is so Vite can analyze and include them
        return `${quote}${specifier}${quote}`;
      } catch {
        // If resolution fails, leave it as-is
        return match;
      }
    },
  );

  // Prepend static imports to ensure files are compiled
  // These are executed at module load time, ensuring Vite includes them
  if (imports.length > 0) {
    return `${imports.join('\n')}\n${transformedCode}`;
  }

  return transformedCode;
}

/**
 * Creates a Vite plugin that transforms `import.meta.resolve()` calls
 * to relative paths that Vite can compile and include in the build.
 *
 * This plugin is necessary because Vite doesn't handle `import.meta.resolve()`
 * calls during bundling for route DSL files. For local imports (relative paths),
 * we transform them to simple relative paths that Vite can analyze and compile.
 *
 * The plugin transforms calls like:
 * ```typescript
 * layout(import.meta.resolve('./Layout.tsx'), pages)
 * ```
 * to:
 * ```typescript
 * layout('./Layout.tsx', pages)
 * ```
 *
 * Vite will then compile these files and include them in the bundle.
 * In library mode, they'll be inlined into the main bundle.
 *
 * @param options - Optional configuration for the plugin
 * @returns A Vite plugin instance
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { routesDslPlugin } from '@equinor/fusion-framework-vite-plugin-routes-dsl';
 *
 * export default {
 *   plugins: [
 *     routesDslPlugin()
 *   ]
 * };
 * ```
 */
export const routesDslPlugin = (options: RoutesDslPluginOptions = {}): Plugin => {
  const { transformResolve = true } = options;
  let viteRoot: string | undefined;
  let outDir: string | undefined;
  const routeFiles = new Set<string>();

  return {
    name: 'fusion-framework-vite-plugin-routes-dsl',
    enforce: 'pre', // Run before other plugins
    configResolved(config) {
      // Store the root directory for path resolution
      viteRoot = config.root;
      outDir = config.build.outDir;
    },
    // Modify build config to include route files as entry points
    config(config, { command }) {
      if (command === 'build') {
        // We'll modify rollupOptions.input in buildStart after we've collected route files
        return {};
      }
      return {};
    },
    transform(code, id) {
      // Skip node_modules and files that don't contain import.meta.resolve
      if (
        !transformResolve ||
        id.includes('node_modules') ||
        !code.includes('import.meta.resolve') ||
        !viteRoot
      ) {
        return null;
      }

      // Track route files referenced by import.meta.resolve
      const fileDir = dirname(id);
      const matches = code.matchAll(/import\.meta\.resolve\((['"`])([^'"`]+)\1\)/g);
      for (const match of matches) {
        const specifier = match[2];
        if (specifier.startsWith('./') || specifier.startsWith('../')) {
          try {
            const resolvedPath = resolve(fileDir, specifier);
            routeFiles.add(resolvedPath);
            // Ensure Vite watches and includes these files
            this.addWatchFile(resolvedPath);
          } catch {
            // Ignore resolution errors
          }
        }
      }

      const transformedCode = transformImportMetaResolve(code, id, viteRoot, routeFiles);

      // Only return transformed code if it changed
      if (transformedCode === code) {
        return null;
      }

      return {
        code: transformedCode,
        map: null, // Source maps not needed for this transformation
      };
    },
    // Load route files to ensure they're compiled and included
    load(id) {
      // If this is a route file, ensure it's loaded and compiled
      if (routeFiles.has(id)) {
        // Return null to let Vite handle it normally, but ensure it's in the graph
        return null;
      }
      return null;
    },
    // Ensure route files are included in the build
    buildStart() {
      for (const routeFile of routeFiles) {
        // Add as watch file to ensure Vite processes it
        this.addWatchFile(routeFile);
      }
    },
    // Use options hook to modify rollup input and include route files as entry points
    options(opts) {
      // Add route files as additional entry points so Vite compiles them
      // In library mode with inlineDynamicImports: true, they'll be inlined into main bundle
      if (opts.input && typeof opts.input === 'object' && !Array.isArray(opts.input)) {
        const input = opts.input as Record<string, string>;
        // Add each route file as an entry point
        for (const routeFile of routeFiles) {
          const relativePath = relative(viteRoot!, routeFile)
            .replace(/\.tsx?$/, '')
            .replace(/\//g, '-');
          input[`route-${relativePath}`] = routeFile;
        }
      }
      return opts;
    },
    // Use resolveId to ensure route files are resolved and included
    resolveId(id, importer) {
      // If this is a route file being dynamically imported, ensure it's resolved
      if (importer && routeFiles.has(id)) {
        return id;
      }
      // Also handle relative imports that match route files
      if (importer && (id.endsWith('.tsx') || id.endsWith('.ts'))) {
        try {
          const resolved = resolve(dirname(importer), id);
          if (routeFiles.has(resolved)) {
            return resolved;
          }
        } catch {
          // Ignore resolution errors
        }
      }
      return null;
    },
  };
};

export default routesDslPlugin;
