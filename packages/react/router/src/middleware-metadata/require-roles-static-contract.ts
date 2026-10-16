/**
 * Static-recognition contract for `requireRoles` calls in route modules.
 *
 * A build consumer (the route manifest producer) can publish role requirements without running
 * page modules by recognising, in a route module's `middleware` export array, a call expression
 * whose callee is the named import `exportName` from `moduleSpecifier` (aliases allowed), with:
 *
 * 1. an array literal of string literals as the first argument, and
 * 2. optionally an object literal `{ mode: 'all' | 'any' }` as the second argument.
 *
 * The literal arguments must then be passed through `normalizeRolesRequirement` so published
 * metadata matches runtime behaviour. Any other middleware entry, including `requireRoles`
 * called with non-literal arguments or imported from another module, is `{ kind: 'custom' }`.
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
