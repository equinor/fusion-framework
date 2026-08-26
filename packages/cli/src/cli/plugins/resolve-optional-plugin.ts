import type { Command } from 'commander';

import { isModuleNotFoundError } from './is-module-not-found-error.js';

/**
 * Dynamically imports an optional CLI plugin package's default export factory.
 *
 * Used to wire a specific, known plugin package into a built-in command without declaring
 * it as a hard dependency of `@equinor/fusion-framework-cli` — the caller decides what to do
 * (e.g. register a stub) when the package isn't installed.
 *
 * @param packageName - The npm package name to dynamically import.
 * @returns The package's default export, called with no arguments; `null` if the package
 * isn't installed.
 * @throws The original error, for any failure other than the package not being found.
 */
export async function resolveOptionalPlugin(
  packageName: string,
): Promise<((program: Command) => void) | null> {
  try {
    const mod: { default?: (defaults?: unknown) => (program: Command) => void } = await import(
      packageName
    );
    // The package resolved but its default export isn't a factory: a real bug in that package,
    // not the "package not installed" case the install-hint fallback exists for.
    if (typeof mod.default !== 'function') {
      throw new Error(`Expected "${packageName}"'s default export to be a factory function.`);
    }
    return mod.default();
  } catch (error) {
    // The optional package itself is absent; let the caller register its install-hint fallback.
    if (isModuleNotFoundError(error, packageName)) {
      return null;
    }
    throw error;
  }
}
