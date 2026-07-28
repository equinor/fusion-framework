import { existsSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import type { PackageJson } from 'read-package-up';

import { assert } from '@equinor/fusion-framework-cli/utils';

/**
 * Resolves the entry point of a given package.
 *
 * This function checks for common entry point fields in the package.json (entrypoint, main, module),
 * and falls back to typical source files if not found. It returns the first existing entry.
 *
 * @param packageJson - The package.json object to resolve from.
 * @param pkgPath - The path to the package.json file (used for relative resolution).
 * @returns The relative path to the resolved entry point.
 * @throws Will throw an error if no entry point can be resolved.
 */
export const resolveEntryPoint = (packageJson: PackageJson, pkgPath = ''): string => {
  // List of possible entry points, prioritized by common convention.
  const entrypoint = [
    packageJson.entrypoint,
    packageJson.main,
    packageJson.module,
    'src/index.ts',
    'src/index.tsx',
    'src/index.js',
    'src/index.jsx',
  ]
    // Filter out undefined/null values.
    .filter((x): x is string => !!x)
    // Map to relative paths from the package root.
    .map((x): string => relative(dirname(pkgPath), x))
    // Find the first entry that actually exists on disk.
    .find((entry) => existsSync(entry));

  // Assert that an entry point was found, otherwise throw.
  assert(entrypoint, 'failed to resolve entrypoint');

  return entrypoint;
};
