import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PackageJson } from 'type-fest';
import { resolvePackageJsonWorkspaceDependencies } from './resolve-workspace-dependencies.js';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';

/**
 * Options for updating package.json
 */
interface UpdatePackageJsonOptions {
  /** Whether to resolve workspace dependencies to npm versions */
  resolveWorkspaceDependencies?: boolean;
  /** Properties to update in package.json */
  updates?: Partial<PackageJson>;
}

/**
 * Updates the package.json file with the provided properties and resolves workspace dependencies.
 *
 * This function reads the package.json file from the target directory, optionally resolves
 * workspace dependencies to their latest npm versions, applies property updates, and writes
 * the updated content back to the file. It preserves the original formatting and structure.
 *
 * @param targetDir - The target directory containing the package.json file
 * @param options - Configuration options for the update operation
 * @param options.resolveWorkspaceDependencies - Whether to resolve workspace dependencies to npm versions
 * @param options.updates - Properties to update in package.json
 * @param logger - Optional logger for progress feedback and debugging
 * @throws {Error} If package.json cannot be read, parsed, or written
 *
 * @example
 * ```typescript
 * // Update just the name
 * await updatePackageJson('/path/to/project', {
 *   updates: { name: 'my-new-app' }
 * });
 *
 * // Update multiple properties and resolve workspace deps
 * await updatePackageJson('/path/to/project', {
 *   updates: { name: 'my-new-app', version: '1.0.0' },
 *   resolveWorkspaceDependencies: true
 * }, logger);
 * ```
 */
export const updatePackageJson = async (
  targetDir: string,
  options?: UpdatePackageJsonOptions,
  logger?: ConsoleLogger,
): Promise<void> => {
  const packageJsonPath = join(targetDir, 'package.json');

  try {
    // Read the existing package.json file from the target directory
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
    const originalPackageJson: PackageJson = JSON.parse(packageJsonContent);

    // Create a shallow copy to avoid mutating the original object
    let updatedPackageJson = { ...originalPackageJson };

    // Resolve workspace dependencies to npm versions if requested
    if (options?.resolveWorkspaceDependencies) {
      logger?.debug('Resolving workspace dependencies');
      // Create a deep copy for resolution to avoid mutating the original
      const packageJsonForResolution = JSON.parse(JSON.stringify(originalPackageJson));
      await resolvePackageJsonWorkspaceDependencies(packageJsonForResolution, logger);
      updatedPackageJson = packageJsonForResolution;
    }

    // Apply property updates if provided
    if (options?.updates) {
      logger?.debug(`Applying updates: ${Object.keys(options.updates).join(', ')}`);
      updatedPackageJson = { ...updatedPackageJson, ...options.updates } as PackageJson;
    }

    // Check if there are actual changes to avoid unnecessary file writes
    const hasChanges = JSON.stringify(originalPackageJson) !== JSON.stringify(updatedPackageJson);

    if (hasChanges) {
      logger?.debug('Writing updated package.json to disk');
      // Use JSON.stringify with 2-space indentation to maintain readable formatting
      writeFileSync(packageJsonPath, `${JSON.stringify(updatedPackageJson, null, 2)}\n`);
    } else {
      logger?.debug('No changes detected, skipping package.json update');
    }
  } catch (error) {
    // Wrap any errors with context about the failed operation
    throw new Error(
      `Failed to update package.json: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
