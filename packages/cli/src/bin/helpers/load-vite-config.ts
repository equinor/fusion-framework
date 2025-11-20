import { loadConfigFromFile, mergeConfig, type UserConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

import { basename, dirname, extname } from 'node:path';

import {
  resolveEntryPoint,
  type RuntimeEnv,
  type ResolvedPackage,
} from '@equinor/fusion-framework-cli/lib';
import { reactRouterPlugin } from '@equinor/fusion-framework-react-router/vite-plugin';

/**
 * Loads and merges the Vite configuration for a given package and environment.
 * Throws errors if the output directory is invalid (root or src).
 *
 * @param env - The runtime environment (mode, etc).
 * @param pkg - The resolved package information.
 * @returns The merged Vite UserConfig object.
 */
export const loadViteConfig = async (env: RuntimeEnv, pkg: ResolvedPackage) => {
  const { packageJson, root } = pkg;
  // Load local Vite config file if present
  const { config: localViteConfig } = (await loadConfigFromFile(env)) ?? {};
  // Determine output file and entrypoint
  const outFile = packageJson.main ?? packageJson.module ?? './dist/bundle.js';
  const entrypoint = resolveEntryPoint(root);

  if (env.command === 'build') {
    // Prevent output directory from being the project root
    if (dirname(outFile) === root) {
      throw new Error(
        'outDir cannot be root, please specify package.main or package.module in package.json',
      );
    }

    // Prevent output directory from being the src directory
    if (dirname(outFile) === 'src') {
      throw new Error(
        'outDir cannot be src, please specify package.main or package.module in package.json',
      );
    }

    // Prevent output directory from being the current working directory
    if (dirname(outFile) === process.cwd()) {
      throw new Error(
        'outDir cannot be the current working directory, please specify package.main or package.module in package.json',
      );
    }
  }

  // Merge default and local Vite configs
  return mergeConfig(
    {
      root,
      plugins: [tsConfigPaths(), reactRouterPlugin({ debug: true })],
      define: {
        // Set environment variables for the build
        'process.env.NODE_ENV': JSON.stringify(env.mode),
        'process.env.NODE_DEBUG': env.mode !== 'production',
        // todo - remove in future update
        'process.env.FUSION_LOG_LEVEL': env.mode === 'production' ? 1 : 3,
      },
      build: {
        outDir: dirname(outFile),
        lib: {
          entry: entrypoint,
          fileName: basename(outFile, extname(outFile)),
          formats: ['es'],
        },
        emptyOutDir: true,
      },
      // @todo - custom logger
    } satisfies UserConfig,
    localViteConfig ?? {},
  );
};

// Export as default for convenience
export default loadViteConfig;
