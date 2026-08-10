import type { Observable } from 'rxjs';
import { of } from 'rxjs';

import type { IHttpClient } from '@equinor/fusion-framework-module-http';

import { AppClient } from '../AppClient.js';
import type { AppConfig, AppManifest, ConfigEnvironment } from '../types.js';

/**
 * An {@link AppClient} that answers `getAppManifest` and `getAppConfig` for one
 * known app locally, delegating everything else — other app keys, tagged
 * requests, builds, settings — to the real client it wraps.
 *
 * @remarks
 * Whatever `client` was resolved to (a pre-configured http client, or one created
 * through service discovery) still backs every method this class doesn't
 * override, so pointing service discovery at a different registry or a real
 * local mock server keeps working unchanged.
 *
 * @example
 * ```ts
 * builder.setClient(async ({ requireInstance }) => {
 *   const http = await requireInstance('http');
 *   return new MockAppClient(http.createClient('apps'), manifest, config);
 * });
 * ```
 */
export class MockAppClient extends AppClient {
  #manifest: AppManifest;
  #config?: AppConfig;

  /**
   * @param client - The real {@link IHttpClient} to delegate all other requests to.
   * @param manifest - The manifest to return for `getAppManifest({ appKey: manifest.appKey })`.
   * @param config - The config to return for `getAppConfig({ appKey: manifest.appKey })`, if any.
   */
  constructor(client: IHttpClient, manifest: AppManifest, config?: AppConfig) {
    super(client);
    this.#manifest = manifest;
    this.#config = config;
  }

  /**
   * Answers with the manifest passed to the constructor when `args` matches
   * this client's own app key and no tag; otherwise delegates to the real client.
   *
   * @param args - The app key and optional tag to resolve a manifest for.
   * @returns An observable of the resolved {@link AppManifest}.
   */
  override getAppManifest(args: { appKey: string; tag?: string }): Observable<AppManifest> {
    return args.appKey === this.#manifest.appKey && !args.tag
      ? of(this.#manifest)
      : super.getAppManifest(args);
  }

  /**
   * Answers with the config passed to the constructor when `args` matches this
   * client's own app key and tag; otherwise delegates to the real client.
   *
   * @template TType - The shape of the config's `environment` data.
   * @param args - The app key and optional tag to resolve config for.
   * @returns An observable of the resolved {@link AppConfig}.
   */
  override getAppConfig<TType extends ConfigEnvironment = ConfigEnvironment>(args: {
    appKey: string;
    tag?: string;
  }): Observable<AppConfig<TType>> {
    // config is fetched against the manifest's own build version, not an explicit override tag,
    // so a matching tag is treated the same as no tag at all
    const isOwnTag = !args.tag || args.tag === this.#manifest.build?.version;
    return args.appKey === this.#manifest.appKey && isOwnTag && this.#config
      ? of(this.#config as AppConfig<TType>)
      : super.getAppConfig(args);
  }
}

export default MockAppClient;
