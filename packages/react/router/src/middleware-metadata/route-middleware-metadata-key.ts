/**
 * Property key under which built-in middleware factories attach their inspectable metadata.
 *
 * A registered symbol is used so metadata written by one bundled copy of the router package is
 * readable by another (for example an application bundle and a host or build tool). The property
 * is non-enumerable and read-only, so it never appears in serialized route objects.
 */
export const routeMiddlewareMetadataKey: unique symbol = Symbol.for(
  '@equinor/fusion-framework-react-router/middleware-metadata',
);

export default routeMiddlewareMetadataKey;
