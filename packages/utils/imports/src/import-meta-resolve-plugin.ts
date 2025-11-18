import type { BuildResult, Plugin } from 'esbuild';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Transforms import.meta.resolve() calls in code to resolved file:// URLs
 * @param code - The code to transform
 * @param baseDir - The base directory for resolving relative paths
 * @returns The transformed code
 */
function transformImportMetaResolve(code: string, baseDir: string): string {
  return code.replace(
    /import\.meta\.resolve\((['"`])([^'"`]+)\1\)/g,
    (match: string, quote: string, specifier: string) => {
      try {
        // Only resolve relative paths (./ or ../), skip package imports
        if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
          return match;
        }

        const resolvedPath = path.resolve(baseDir, specifier);
        const fileUrl = pathToFileURL(resolvedPath).href;
        return `${quote}${fileUrl}${quote}`;
      } catch {
        // If resolution fails, leave it as-is
        return match;
      }
    },
  );
}

/**
 * Gets the appropriate esbuild loader for a file extension
 */
function getLoader(filePath: string): 'ts' | 'tsx' | 'js' | 'jsx' | undefined {
  const ext = path.extname(filePath);
  if (ext === '.tsx' || ext === '.jsx') {
    return ext === '.tsx' ? 'tsx' : 'jsx';
  }
  if (ext === '.ts' || ext === '.mts') {
    return 'ts';
  }
  if (ext === '.js' || ext === '.mjs') {
    return 'js';
  }
  return undefined;
}

/**
 * Safely reads a file, returning undefined on error
 */
async function readFileSafe(filePath: string): Promise<string | undefined> {
  try {
    const fs = await import('node:fs/promises');
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return undefined;
  }
}

/**
 * Collects output files from esbuild result (handles both write: true and write: false)
 */
async function collectOutputFiles(
  result: BuildResult,
): Promise<Array<{ path: string; text: string }>> {
  const files: Array<{ path: string; text: string }> = [];
  const processedPaths = new Set<string>();

  // Collect from outputFiles (write: false case - files in memory)
  if (result.outputFiles) {
    for (const outputFile of result.outputFiles) {
      if (outputFile.path.endsWith('.js') || outputFile.path.endsWith('.mjs')) {
        files.push({ path: outputFile.path, text: outputFile.text });
        processedPaths.add(outputFile.path);
      }
    }
  }

  // Collect from metafile (write: true case - files on disk)
  if (result.metafile?.outputs) {
    for (const outputPath of Object.keys(result.metafile.outputs)) {
      if (processedPaths.has(outputPath)) {
        continue;
      }

      if (outputPath.endsWith('.js') || outputPath.endsWith('.mjs')) {
        const absolutePath = path.isAbsolute(outputPath)
          ? outputPath
          : path.resolve(process.cwd(), outputPath);
        
        const text = await readFileSafe(absolutePath) ?? await readFileSafe(outputPath);
        if (text) {
          files.push({ path: absolutePath, text });
        }
      }
    }
  }

  return files;
}

/**
 * Creates an esbuild plugin that transforms `import.meta.resolve()` calls
 * to resolved file:// URLs at build time.
 *
 * This plugin is necessary because esbuild doesn't handle `import.meta.resolve()`
 * calls during bundling - it leaves them as runtime calls. For local imports
 * (relative paths), we need to resolve them at build time so they work correctly
 * in the bundled output.
 */
export const createImportMetaResolvePlugin = (): Plugin => {
  return {
    name: 'import-meta-resolve',
    setup(build) {
      let entryPointDir: string | undefined;

      // Transform source files during load phase
      build.onLoad({ filter: /.*/ }, async (args) => {
        // Track entry point directory (first non-node_modules file)
        if (args.namespace === 'file' && !entryPointDir && !args.path.includes('node_modules')) {
          entryPointDir = path.dirname(args.path);
        }

        // Skip node_modules
        if (args.path.includes('node_modules')) {
          return undefined;
        }

        // Read and transform file if it contains import.meta.resolve
        const contents = await readFileSafe(args.path);
        if (!contents || !contents.includes('import.meta.resolve')) {
          return undefined;
        }

        const transformedContents = transformImportMetaResolve(contents, path.dirname(args.path));
        if (transformedContents === contents) {
          return undefined;
        }

        const loader = getLoader(args.path);
        return loader ? { contents: transformedContents, loader } : undefined;
      });

      // Transform bundled output files
      build.onEnd(async (result) => {
        if (!entryPointDir) {
          return;
        }

        const files = await collectOutputFiles(result);
        const fs = await import('node:fs/promises');

        for (const file of files) {
          if (!file.text.includes('import.meta.resolve')) {
            continue;
          }

          const transformedText = transformImportMetaResolve(file.text, entryPointDir);
          if (transformedText !== file.text) {
            try {
              await fs.writeFile(file.path, transformedText, 'utf-8');
            } catch (error) {
              console.warn(`Failed to write transformed output to ${file.path}:`, error);
            }
          }
        }
      });
    },
  };
};

