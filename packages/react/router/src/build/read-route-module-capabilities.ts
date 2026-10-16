import { readFile } from 'node:fs/promises';

import { detectRouteModuleCapabilities } from './detect-route-module-capabilities.js';
import { findStarReexports } from './find-star-reexports.js';
import { resolveRelativeModule } from './resolve-relative-module.js';
import type { RouteModuleCapability } from './types.js';

/** Canonical capability order, used to merge capabilities from re-export targets. */
const CAPABILITY_ORDER: readonly RouteModuleCapability[] = [
  'component',
  'clientLoader',
  'action',
  'handle',
  'errorElement',
  'hydrateFallback',
  'shouldRevalidate',
  'middleware',
];

/** Capabilities of a route module including its star re-exports. */
export interface RouteModuleCapabilityScan {
  /** Capabilities in canonical order. */
  capabilities: RouteModuleCapability[];
  /** Absolute paths of re-export targets that were read, excluding the module itself. */
  reexportFiles: string[];
  /** Star re-exports whose target could not be resolved, with the absolute path of the re-exporting module. */
  unresolved: Array<{ importer: string; specifier: string }>;
}

/**
 * Reads a route module and detects its capabilities, expanding relative star
 * re-exports (`export * from './loader'`) from the files they point to. Nothing is
 * imported or executed.
 *
 * Star re-exports never forward `default`, so they cannot add the `component`
 * capability. Package specifiers and missing targets cannot be expanded; they are
 * returned as `unresolved` so callers can report them instead of treating the route
 * as having fewer capabilities (for example, appearing to have no `middleware`).
 *
 * @param file - Absolute route module path.
 * @returns Capabilities, the re-export files that were read and unresolved re-exports.
 * @throws {Error} When the module or a re-export target exists but cannot be read.
 */
export async function readRouteModuleCapabilities(
  file: string,
): Promise<RouteModuleCapabilityScan> {
  const found = new Set<RouteModuleCapability>();
  const reexportFiles: string[] = [];
  const unresolved: RouteModuleCapabilityScan['unresolved'] = [];
  const visited = new Set<string>([file]);

  /**
   * Adds the capabilities of one module and follows its star re-exports.
   *
   * @param current - Absolute module path.
   * @param isRoot - Whether `current` is the route module itself (only it can export `default`).
   */
  const scan = async (current: string, isRoot: boolean): Promise<void> => {
    const source = await readFile(current, 'utf8');
    // Re-exported targets contribute named exports only
    for (const capability of detectRouteModuleCapabilities(source)) {
      // `export *` never forwards a default export
      if (isRoot || capability !== 'component') found.add(capability);
    }
    // Each star re-export may add named capabilities from its target
    for (const specifier of findStarReexports(source)) {
      const target = specifier.startsWith('.')
        ? await resolveRelativeModule(current, specifier)
        : null;
      // Packages and missing files cannot be read, so their exports stay unknown
      if (!target) {
        unresolved.push({ importer: current, specifier });
        // Nothing to scan for an unknown target
        continue;
      }
      // Cycles between re-exporting modules are scanned once
      if (visited.has(target)) continue;
      visited.add(target);
      reexportFiles.push(target);
      await scan(target, false);
    }
  };

  await scan(file, true);
  // Stable capability order keeps graphs deterministic across scans
  const capabilities = CAPABILITY_ORDER.filter((capability) => found.has(capability));
  return {
    capabilities,
    reexportFiles,
    unresolved,
  };
}
