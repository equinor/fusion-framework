import type { DevServerOptions, FusionTemplateEnv } from '@equinor/fusion-framework-dev-server';

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
