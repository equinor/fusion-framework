/**
 * Static-recognition contract for `requireRoles` calls in route modules.
 *
 * A build consumer (the route manifest producer) can publish role requirements without running
 * page modules by recognising, in a route module's `middleware` export array, a call expression
 * whose callee is the named import `exportName` from `moduleSpecifier` (aliases allowed), with:
 *
 * 1. a first argument resolving to an array of strings, and
 * 2. optionally a second argument resolving to an object `{ mode: 'all' | 'any' }`.
 *
 * Arguments resolve statically when written as literals or as references to `const` bindings
 * declared in the same module with statically resolvable values. The resolved values must then be
 * passed through `normalizeRolesRequirement` so published metadata matches runtime behaviour.
 *
 * A recognised call is a known gate: when its arguments cannot be resolved statically (runtime
 * calls, imported values, spreads, template literals with expressions) or fail normalization,
 * publication must fail with a diagnostic naming the route module file and field. It must never be
 * omitted or reported as `{ kind: 'custom' }`. Only middleware that is not a recognised
 * `requireRoles` call is `{ kind: 'custom' }`.
 */
export const requireRolesStaticContract = Object.freeze({
  /** Package specifier applications import the helper from. */
  moduleSpecifier: '@equinor/fusion-framework-react-router',
  /** Named export of the helper. */
  exportName: 'requireRoles',
  /** Route module export holding the middleware array. */
  routeExportName: 'middleware',
  /** Mode used when the options argument or its `mode` is omitted. */
  defaultMode: 'all',
  /** Accepted values for `mode`. */
  modes: Object.freeze(['all', 'any'] as const),
} as const);

export default requireRolesStaticContract;
