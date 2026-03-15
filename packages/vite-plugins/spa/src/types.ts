import type { ConfigEnv } from 'vite';

/**
 * Base type for template environment variables.
 *
 * @remarks
 * A loose record that can hold any key-value pairs later flattened into
 * `FUSION_SPA_*` environment variables by {@link objectToEnv}.
 * Extend this type (or use {@link FusionTemplateEnv}) when you need a
 * strongly-typed environment shape.
 */
export type TemplateEnv = Record<string, unknown>;

/**
 * Describes a single resource that the SPA service worker should intercept.
 *
 * When the service worker sees a fetch request whose URL starts with {@link url},
 * it optionally rewrites the path and attaches an OAuth Bearer token obtained
 * from the MSAL module for the specified {@link scopes}.
 *
 * @example
 * ```ts
 * const resource: ResourceConfiguration = {
 *   url: '/app-proxy',
 *   rewrite: '/@fusion-api/app',
 *   scopes: ['api://backend/.default'],
 * };
 * ```
 */
export type ResourceConfiguration = {
  /** URL path prefix to match against outgoing fetch requests. */
  url: string;
  /** OAuth scopes used to acquire a Bearer token for matched requests. */
  scopes?: string[];
  /** Replacement path prefix; the matched {@link url} segment is swapped for this value. */
  rewrite?: string;
};

/**
 * Strongly-typed environment configuration consumed by the default SPA
 * HTML template and bootstrap script.
 *
 * @remarks
 * Values are flattened to `FUSION_SPA_*` environment variables at build time
 * and injected into the HTML template via Vite's
 * {@link https://vite.dev/guide/env-and-mode.html#html-constant-replacement | constant replacement}.
 * They can also be overridden through a `.env` file.
 *
 * @see {@link PluginOptions.generateTemplateEnv} for how to supply these values.
 */
export type FusionTemplateEnv = {
  /** HTML `<title>` for the generated page. */
  title: string;

  /**
   * Path to the bootstrap module loaded by the HTML template.
   *
   * @defaultValue `'/@fusion-spa-bootstrap.js'`
   */
  bootstrap: string;

  /** Optional telemetry configuration. */
  telemetry?: {
    /**
     * Minimum severity level for console telemetry output.
     *
     * @remarks
     * Maps to `TelemetryLevel` values: Debug (0), Information (1),
     * Warning (2), Error (3), Critical (4).
     *
     * @defaultValue `1` (Information)
     */
    consoleLevel?: number;
  };

  /**
   * Portal to load and render inside the SPA shell.
   *
   * @remarks
   * The `id` can reference:
   * - A local npm package (e.g. `@equinor/fusion-framework-dev-portal`)
   * - A portal identifier from the Fusion Portal Service
   * - Any custom portal implementation
   */
  portal: {
    /** Portal identifier used to fetch the portal manifest. */
    id: string;
    /**
     * Version tag for the portal manifest.
     * @defaultValue `'latest'`
     */
    tag?: string;
    /**
     * When `true`, portal entry point requests are prefixed with `/portal-proxy`
     * so they can be intercepted by a proxy server.
     * @defaultValue `false`
     */
    proxy?: boolean;
  };

  /** Service discovery endpoint and authentication scopes. */
  serviceDiscovery: {
    /** URL of the Fusion service discovery endpoint. */
    url: string;
    /** OAuth scopes required to authenticate service discovery requests. */
    scopes: string[];
  };

  /** Microsoft Authentication Library (MSAL) configuration for Azure AD. */
  msal: {
    /** Azure AD tenant identifier. */
    tenantId: string;
    /** Application (client) identifier registered in Azure AD. */
    clientId: string;
    /** Redirect URI for the authentication callback. */
    redirectUri: string;
    /**
     * When `'true'`, the application automatically prompts for login
     * on initial load.
     */
    requiresAuth: string;
  };

  /** Service worker resource interception configuration. */
  serviceWorker: {
    /**
     * Array of resource configurations the service worker will manage.
     * @see {@link ResourceConfiguration}
     */
    resources: ResourceConfiguration[];
  };
};

/**
 * Factory function that produces a partial template environment from the
 * current Vite {@link ConfigEnv} (mode, command, etc.).
 *
 * @remarks
 * Returned values are merged with defaults and flattened into
 * `FUSION_SPA_*` environment variables.
 *
 * @template TEnv - Shape of the environment configuration. Defaults to {@link TemplateEnv}.
 * @param configEnv - Vite configuration environment containing `mode` and `command`.
 * @returns A partial environment object, or `undefined` to use defaults only.
 */
export type TemplateEnvFn<TEnv extends TemplateEnv> = (
  configEnv: ConfigEnv,
) => Partial<TEnv> | undefined;
