import { Buffer } from 'node:buffer';

import schema from './my-api.openapi.json' with { type: 'json' };

import { defineService } from '@equinor/fusion-openapi-mock-server/discovery';

/**
 * Resolves the deterministic persona carried by a mock bearer token.
 *
 * @param authorization - HTTP Authorization header.
 * @returns The token's object ID, or `anonymous` without a valid mock bearer token.
 * @throws When a bearer token does not contain a string `oid` claim.
 */
const resolvePersona = (authorization: string | undefined): string => {
  const [, token] = authorization?.split(' ') ?? [];
  const payload = token?.split('.')[1];
  // The cookbook reports missing authorization explicitly so its Playwright assertion is meaningful.
  if (!payload) return 'anonymous';

  const claims: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  // A malformed mock token must fail visibly rather than masquerading as an anonymous request.
  if (
    typeof claims !== 'object' ||
    claims === null ||
    !('oid' in claims) ||
    typeof claims.oid !== 'string'
  ) {
    throw new Error('Mock bearer token is missing a string oid claim');
  }
  return claims.oid;
};

/**
 * Models an app-owned API that is intentionally not registered in Fusion service discovery.
 *
 * The app supplies this endpoint directly in `app.config.local.ts`, while this module supplies the
 * server behavior and OpenAPI contract. `serviceDiscovery: false` prevents the mock server from
 * advertising `my-api`; changing it to a discovery mode would teach the wrong production wiring
 * for a service whose URL is owned by application configuration.
 */
export default defineService({
  key: 'my-api',
  serviceDiscovery: false,
  schema,
  // Override the schema-generated field to make the visible greeting stable across test runs.
  components: {
    Greeting: {
      message: () => 'Hello from the mock server!',
    },
  },
  middleware: (router) => {
    // Echo the bearer persona so the browser test proves Fusion HTTP received the selected token.
    router.get('/identity', (request, response) => {
      response.json({
        userId: resolvePersona(request.headers.authorization),
      });
    });
  },
});
