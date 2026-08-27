/**
 * Declarative registry of the service contracts `check-openapi.ts` verifies.
 *
 * Data only: adding a service or an API version is an entry here, never a change to the
 * checker. A future Roles API 2.0 is another `versions` entry beside the 1.0 one.
 *
 * @packageDocumentation
 */

/** One snapshotted API version of a service. */
export type OpenApiVersionConfig = {
  /** Version folder the snapshot lives in, e.g. `v1`. Named in CLI output. */
  key: string;
  /** API version the document must publish in `info.version`, e.g. `1.0`. */
  apiVersion: string;
  /** Absolute URL of the remote OpenAPI document. */
  url: string;
  /** Package-relative snapshot path, which `exports` also publishes as a subpath. */
  snapshotPath: string;
  /** Package-relative directories implementing the contract, listed in drift reports. */
  sourceDirs: readonly string[];
};

/** A service the check can be run for, with every API version it snapshots. */
export type OpenApiServiceConfig = {
  /** CLI argument selecting this service, e.g. `roles`. */
  name: string;
  /** Human-readable contract name used in CLI output. */
  label: string;
  /** Versions checked whenever the service is selected. */
  versions: readonly OpenApiVersionConfig[];
};

/** Every service the check covers, keyed by the name passed on the command line. */
export const OPENAPI_SERVICES: readonly OpenApiServiceConfig[] = [
  {
    name: 'roles',
    label: 'Fusion Roles V2 API',
    versions: [
      {
        key: 'v1',
        apiVersion: '1.0',
        url: 'https://rolesv2.ci.api.fusion-dev.net/openapi/api-v1.json',
        snapshotPath: 'src/roles/v1/openapi.json',
        sourceDirs: ['src/roles/endpoints', 'src/roles/v1/schemas'],
      },
    ],
  },
];
