import { compareCodeUnits } from './compare-code-units.js';
import type { ResolvedRoute, RouteDiagnostic } from './types.js';

/**
 * Normalizes a path pattern into the shape React Router matches against, so
 * patterns that differ only by parameter names or letter case compare equal.
 *
 * @param routePath - Full route path pattern.
 * @returns A comparison key.
 */
function toMatchKey(routePath: string): string {
  return (
    routePath
      .toLowerCase()
      .split('/')
      // Parameter names do not affect matching, only whether the segment is optional
      .map((segment) => (segment.startsWith(':') ? (segment.endsWith('?') ? ':?' : ':') : segment))
      .join('/')
  );
}

/**
 * Validates graph-wide route rules that apply to both discovered and explicit routes.
 *
 * - Every module must provide a component, `clientLoader` or `action` capability.
 * - Two unrelated endpoints must not match the same URL. An endpoint is an index
 *   route, or a route without an index descendant at its own path. Layouts, and
 *   routes that delegate their URL to an index child, wrap rather than compete.
 *
 * @param routes - Routes from one route source.
 * @returns Diagnostics naming the conflicting modules.
 */
export function validateRoutes(routes: readonly ResolvedRoute[]): RouteDiagnostic[] {
  const diagnostics: RouteDiagnostic[] = [];
  // Index ancestors are looked up by ID while detecting wrapper routes
  const byId = new Map(routes.map((route) => [route.id, route]));

  // Report each module once, even when the registry reuses it at several locations
  const reportedModules = new Set<string>();
  // Check every route for at least one renderable or data capability
  for (const route of routes) {
    // Components and data functions make a module routable; handle-only modules are not
    const usable = route.capabilities.some(
      (capability) =>
        capability === 'component' || capability === 'clientLoader' || capability === 'action',
    );
    // Skip usable routes and modules already reported
    if (usable || reportedModules.has(route.module)) continue;
    reportedModules.add(route.module);
    diagnostics.push({
      severity: 'error',
      code: 'missing-route-capability',
      message: `Route module ${route.module} must export a default component, clientLoader or action; move helpers to a private "_" path or outside the route directory.`,
      files: [route.module],
    });
  }

  // A route whose index child renders at the same URL is a wrapper, not a competing match
  const wrappers = new Set<string>();
  // Start from each index route and mark ancestors sharing its path
  for (const route of routes) {
    // Only index routes can turn an ancestor into a wrapper
    if (route.kind !== 'index') continue;
    let ancestor = route.parentId ? byId.get(route.parentId) : undefined;
    // Climb to the root, since the shared-path ancestor need not be the direct parent
    while (ancestor) {
      // Layouts never compete, so only named routes need marking
      if (ancestor.kind === 'route' && ancestor.path === route.path) wrappers.add(ancestor.id);
      ancestor = ancestor.parentId ? byId.get(ancestor.parentId) : undefined;
    }
  }

  const endpoints = new Map<string, ResolvedRoute[]>();
  // Group endpoints by the URL shape they match
  for (const route of routes) {
    // Layouts and wrappers delegate their URL, so they cannot collide
    if (route.kind === 'layout' || wrappers.has(route.id)) continue;
    const key = toMatchKey(route.path);
    endpoints.set(key, [...(endpoints.get(key) ?? []), route]);
  }
  // Every URL shape with more than one endpoint is ambiguous
  for (const matches of endpoints.values()) {
    // A single endpoint per URL shape is the expected case
    if (matches.length < 2) continue;
    // Conflicting modules, deduplicated for reused registry modules
    const files = [...new Set(matches.map((match) => match.module))].sort(compareCodeUnits);
    // Distinct path spellings that collide, e.g. differing parameter names
    const paths = [...new Set(matches.map((match) => match.path))].sort(compareCodeUnits);
    // Route IDs pinpoint each conflicting occurrence
    const ids = matches.map((match) => match.id).sort(compareCodeUnits);
    diagnostics.push({
      severity: 'error',
      code: 'duplicate-route-path',
      message: `Several routes match the URL ${paths.join(', ')}: ${ids.join(', ')}.`,
      files,
    });
  }
  return diagnostics;
}
