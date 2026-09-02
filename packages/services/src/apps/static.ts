/**
 * Supported API versions for the Fusion Apps service.
 *
 * The version is an endpoint's single discriminator. Every endpoint declares one
 * version contract keyed by the *concrete* enum value — never by the `v1` key —
 * pairing the arguments that version accepts with the response it publishes.
 * Callers may name a version three ways: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * `extractVersion` normalises all three to the enum value before a path is built
 * or a schema is selected, and the same resolution happens at the type level, so
 * the three spellings infer identical argument and response types.
 *
 * Adding a version means adding a member here, a sibling `v2` module
 * graph, and a `[ApiVersion.v2]` entry in the endpoints that publish it. No
 * existing version 1.0 schema is edited, and no runtime registry is consulted.
 *
 * @example
 * ```ts
 * // All three calls resolve to the same concrete version, path, and schemas.
 * getApp('v1', client)({ appIdentifier: 'my-app' });
 * getApp('1.0', client)({ appIdentifier: 'my-app' });
 * getApp(ApiVersion.v1, client)({ appIdentifier: 'my-app' });
 * ```
 */
export enum ApiVersion {
  /** Fusion Apps API version 1.0 — schemas and model types live in `v1/`. */
  v1 = '1.0',
}
