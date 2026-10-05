import type { DevServerOptions, FusionTemplateEnv } from '@equinor/fusion-framework-dev-server';

/** Analytics settings for the standalone mock server. */
export interface MockServerAnalyticsOptions {
  /**
   * JSON Lines file every analytics batch the app sends is appended to, relative to the project
   * root. Defaults to `.fusion-mock/analytics.jsonl`, in a folder ignored by Git. Set `false` to
   * keep analytics in memory only.
   */
  record?: string | false;
  /**
   * Recordings loaded at start, relative to the project root: earlier `record` files, Fusion
   * analytics landing-zone `logs_*.json.gz` files, or folders of them. Their events are shown by the
   * app-feature events query and survive a mock server reset.
   */
  seed?: string | string[];
}

/** Standalone OpenAPI mock-server settings added to development server configuration. */
export interface DevServerMockOptions {
  /** Directory containing `<name>.mock.ts` modules, relative to the project root. Defaults to `mocks`. */
  path?: string;
  /** Port used by direct `<key>.localhost` endpoint URLs. */
  port?: number;
  /** Hostname the standalone mock server binds to. Defaults to `localhost`. */
  host?: string;
  /** Seed used for reproducible generated OpenAPI responses. */
  seed?: number;
  /** Additional non-loopback browser origins allowed to call credentialed mock-auth endpoints. */
  allowedOrigins?: string[];
  /**
   * Help docs folder served as a local `help` service, so the dev portal can show the articles an
   * app opens with `useHelpCenter().openArticle(slug)`. Relative to the project root; may hold the
   * article markdown files directly or in an `articles` subfolder. When omitted, `./docs` and
   * `docs/<appKey>` in parent folders are auto-detected. Set `false` to turn help docs off.
   */
  helpDocs?: string | false;
  /**
   * Receives the analytics the app sends as a mock Monitor service, records them, and serves them
   * through the Apps service's app-feature events query. On by default; set `false` to turn off.
   */
  analytics?: MockServerAnalyticsOptions | false;
}

declare module '@equinor/fusion-framework-dev-server' {
  /** Development server options contributed when the mock-server CLI plugin is installed. */
  interface DevServerOptions<TEnv extends Partial<FusionTemplateEnv> = Partial<FusionTemplateEnv>> {
    /** Settings consumed by local mock discovery and the standalone `ffc mock-server` process. */
    mockServer?: DevServerMockOptions;
  }
}

/** Compile-time assertion that the module augmentation is compatible with the base options. */
export type MockServerDevServerOptions = DevServerOptions & {
  mockServer?: DevServerMockOptions;
};
