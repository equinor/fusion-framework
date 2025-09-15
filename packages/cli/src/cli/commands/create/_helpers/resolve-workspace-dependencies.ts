import type { PackageJson } from 'type-fest';
import { fetchLatestVersion } from '../../../../lib/utils/package-info.js';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';

/**
 * Dependency type keys in package.json that can contain workspace dependencies
 */
type DependencyType = 'dependencies' | 'devDependencies' | 'peerDependencies';

/**
 * Dependency entry tuple containing package name and version string
 */
type DependencyEntry = [string, string];

/**
 * Checks if a version string represents a workspace dependency.
 *
 * Workspace dependencies are identified by the "workspace:" prefix,
 * which is used in monorepos to reference local packages.
 *
 * @param version - The version string to check
 * @returns True if the version is a workspace dependency (e.g., "workspace:^")
 */
function isWorkspaceDependency(version: unknown): version is string {
  return typeof version === 'string' && version.startsWith('workspace:');
}

/**
 * Processes a single dependency type, resolving workspace dependencies to npm versions.
 *
 * This helper function handles the resolution of workspace dependencies for a specific
 * dependency type (dependencies, devDependencies, or peerDependencies). It identifies
 * workspace dependencies and fetches their latest versions from npm registry in parallel.
 *
 * @param key - The dependency type key (dependencies, devDependencies, etc.)
 * @param deps - The dependencies object to process
 * @param logger - Optional logger for progress feedback and debugging
 * @returns Promise resolving to the processed dependencies with resolved versions
 */
async function processDependencyType(
  key: DependencyType,
  deps: Record<string, string>,
  logger?: ConsoleLogger,
): Promise<{ key: DependencyType; resolved: Record<string, string> }> {
  try {
    // Filter out workspace dependencies that need resolution
    const workspaceDeps: DependencyEntry[] = Object.entries(deps).filter(
      (entry): entry is DependencyEntry => isWorkspaceDependency(entry[1]),
    );

    // Early return if no workspace dependencies found
    if (workspaceDeps.length === 0) {
      logger?.debug(`No workspace dependencies found in ${key}`);
      return { key, resolved: deps };
    }

    logger?.debug(`Resolving ${workspaceDeps.length} workspace dependencies for ${key}`);

    // Resolve all workspace dependencies in parallel for better performance
    const resolvedEntries: DependencyEntry[] = await Promise.all(
      workspaceDeps.map(async ([depName, depVersion]): Promise<DependencyEntry> => {
        try {
          // Fetch latest version from npm registry
          const version = await fetchLatestVersion(depName);
          logger?.debug(`Resolved ${depName}: ${depVersion} -> ${version}`);
          return [depName, version];
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger?.debug(`Failed to resolve ${depName}: ${errorMessage}`);
          // Keep original version if resolution fails to avoid breaking the build
          return [depName, depVersion];
        }
      }),
    );

    // Merge resolved dependencies with non-workspace dependencies
    const resolved = { ...deps };
    for (const [depName, version] of resolvedEntries) {
      resolved[depName] = version;
    }

    logger?.debug(
      `Successfully processed ${key} with ${resolvedEntries.length} resolved dependencies`,
    );
    return { key, resolved };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger?.debug(`Error processing ${key}: ${errorMessage}`);
    // Return original dependencies if processing fails to maintain stability
    return { key, resolved: deps };
  }
}

/**
 * Resolves workspace dependencies in a package.json object to their latest npm versions.
 *
 * This function processes all dependency types (dependencies, devDependencies, peerDependencies)
 * and replaces workspace dependencies (e.g., "workspace:^") with their latest available versions
 * from the npm registry. It processes all dependency types in parallel for optimal performance.
 *
 * @param packageJson - The package.json object to modify (modified in place)
 * @param logger - Optional logger for progress feedback and debugging
 * @throws {Error} If version resolution fails for critical dependencies
 *
 * @example
 * ```typescript
 * const packageJson = {
 *   dependencies: {
 *     "@equinor/fusion-framework": "workspace:^",
 *     "react": "^18.0.0"
 *   }
 * };
 *
 * await resolvePackageJsonWorkspaceDependencies(packageJson, logger);
 * // packageJson.dependencies["@equinor/fusion-framework"] is now "1.0.0"
 * ```
 */
export async function resolvePackageJsonWorkspaceDependencies(
  packageJson: PackageJson,
  logger?: ConsoleLogger,
): Promise<void> {
  // Build array of dependency types that exist in the package.json
  const dependencyTypes: Array<{ key: DependencyType; deps: Record<string, string> }> = [
    { key: 'dependencies' as const, deps: packageJson.dependencies },
    { key: 'devDependencies' as const, deps: packageJson.devDependencies },
    { key: 'peerDependencies' as const, deps: packageJson.peerDependencies },
  ].filter(
    (item): item is { key: DependencyType; deps: Record<string, string> } =>
      item.deps !== undefined && item.deps !== null,
  );

  // Early return if no dependencies found
  if (dependencyTypes.length === 0) {
    logger?.debug('No dependencies found to resolve');
    return;
  }

  logger?.start(`Resolving workspace dependencies for ${dependencyTypes.length} dependency types`);

  try {
    // Process all dependency types in parallel for optimal performance
    const resolvedDependencies = await Promise.all(
      dependencyTypes.map(({ key, deps }) => processDependencyType(key, deps, logger)),
    );

    // Apply resolved dependencies back to the original packageJson object
    for (const { key, resolved } of resolvedDependencies) {
      (packageJson as Record<string, unknown>)[key] = resolved;
    }

    // Calculate total number of dependencies processed for logging
    const totalResolved = resolvedDependencies.reduce(
      (count, { resolved }) => count + Object.keys(resolved).length,
      0,
    );

    logger?.succeed(
      `Workspace dependencies resolved successfully (${totalResolved} total dependencies processed)`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger?.debug(`Error details: ${errorMessage}`);
    // Re-throw with context about the failed operation
    throw new Error(`Failed to resolve workspace dependencies: ${errorMessage}`);
  }
}
