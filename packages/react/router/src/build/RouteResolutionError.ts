import type { RouteDiagnostic } from './types.js';

/**
 * Error thrown by {@link assertRouteGraph} when a resolved route graph contains
 * error diagnostics. The message lists every problem with its source files, and
 * {@link RouteResolutionError.diagnostics} exposes them for tooling.
 */
export class RouteResolutionError extends Error {
  /**
   * @param diagnostics - Error diagnostics that made the route graph unusable.
   */
  constructor(public readonly diagnostics: readonly RouteDiagnostic[]) {
    // Header line followed by one line per diagnostic, naming its source files
    super(
      [
        `Route resolution failed with ${diagnostics.length} error(s):`,
        ...diagnostics.map(
          (diagnostic) =>
            `  - [${diagnostic.code}] ${diagnostic.message} (${diagnostic.files.join(', ')})`,
        ),
      ].join('\n'),
    );
    this.name = 'RouteResolutionError';
  }
}
