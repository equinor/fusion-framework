import { compareCodeUnits } from './compare-code-units.js';
import type { ResolvedRoute, ResolvedRouteKind } from './types.js';

/** Layouts wrap, index routes render at the shared path, then named routes follow. */
const KIND_ORDER: Record<ResolvedRouteKind, number> = { layout: 0, index: 1, route: 2 };

/**
 * Orders sibling routes by path, kind and ID using locale-independent comparison.
 *
 * @param a - First route.
 * @param b - Second route.
 * @returns Sort order for `Array.prototype.sort`.
 */
function compareSiblings(a: ResolvedRoute, b: ResolvedRoute): number {
  return (
    compareCodeUnits(a.path, b.path) ||
    KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
    compareCodeUnits(a.id, b.id)
  );
}

/**
 * Sorts routes into canonical order: a depth-first walk where every parent precedes
 * its children and siblings are ordered by {@link compareSiblings}. The result does
 * not depend on file-system enumeration or registry declaration order.
 *
 * @param routes - Routes with unique IDs.
 * @returns A new array in canonical order.
 */
export function sortRoutes(routes: readonly ResolvedRoute[]): ResolvedRoute[] {
  // Known IDs decide whether a parent reference can be walked
  const ids = new Set(routes.map((route) => route.id));
  const children = new Map<string | null, ResolvedRoute[]>();
  // Bucket routes under their parent so the walk can visit siblings together
  for (const route of routes) {
    // An unknown parent cannot be walked, so the route is treated as a root to avoid losing it
    const parentId = route.parentId && ids.has(route.parentId) ? route.parentId : null;
    children.set(parentId, [...(children.get(parentId) ?? []), route]);
  }
  const sorted: ResolvedRoute[] = [];
  /**
   * Appends the sorted children of one parent, each followed by its own subtree.
   *
   * @param parentId - Parent route ID, or `null` for root routes.
   */
  const visit = (parentId: string | null): void => {
    // Emit each sibling before descending, giving parent-first pre-order
    for (const route of (children.get(parentId) ?? []).sort(compareSiblings)) {
      sorted.push(route);
      visit(route.id);
    }
  };
  visit(null);
  return sorted;
}
