/**
 * Options controlling which requests get app identification headers.
 *
 * By default, only requests to the portal origin and to Fusion service-discovery hosts are
 * tagged. Custom headers trigger a CORS preflight, so other APIs must explicitly allow the
 * headers before their origin is added here.
 */
export type AppIdentificationOptions = {
  /** Set to `false` to stop sending app identification headers. Defaults to `true`. */
  enabled?: boolean;
  /**
   * Additional origins (or URLs, reduced to their origin) that should receive the headers,
   * for example the app's own backend once it allows `x-fusion-app*` in CORS.
   */
  allowedOrigins?: ReadonlyArray<string>;
};

/**
 * Values sent in the app identification headers.
 */
export type AppIdentity = {
  /** The app key from the app manifest. */
  appKey: string;
  /** The app build version, when the manifest provides one. */
  appVersion?: string;
  /** The version of `@equinor/fusion-framework-app` the app runs on. */
  frameworkVersion?: string;
};

/**
 * Accumulated app identification settings, built from one or more
 * {@link AppIdentificationOptions} calls.
 */
export type AppIdentificationSettings = {
  /** Whether identification headers are sent. */
  enabled: boolean;
  /** Normalized origins opted in by the app, in addition to Fusion services. */
  allowedOrigins: ReadonlySet<string>;
};

/**
 * The part of the service discovery provider needed to list Fusion service hosts.
 */
export type ServiceRegistry = {
  resolveServices(): Promise<ReadonlyArray<{ uri: string }>>;
};
