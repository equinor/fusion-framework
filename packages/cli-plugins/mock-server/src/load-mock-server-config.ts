import { FileNotFoundError, importConfig, type EsmModule } from '@equinor/fusion-imports';

import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';

import type { DevServerMockOptions } from './dev-server-options.js';

/** Mock-server settings resolved from `dev-server.config.ts`. */
export interface ResolvedMockServerConfig extends DevServerMockOptions {}

interface DevServerConfigOverrides {
  mockServer?: DevServerMockOptions;
}

interface DevServerConfigModule extends EsmModule {
  default?:
    | DevServerConfigOverrides
    | ((
        env: { command: 'serve'; environment: 'local'; mode: string; root: string },
        args: { base: DevServerOptions },
      ) => DevServerConfigOverrides | Promise<DevServerConfigOverrides | undefined> | undefined);
}

/**
 * Loads standalone mock-server settings from a project's `dev-server.config.ts`.
 *
 * @param root - Project root used to resolve the config file and relative mock path.
 * @returns Mock-server settings explicitly resolved from the project config.
 * @throws {Error} When an existing config cannot be imported or returns an invalid value.
 */
export async function loadMockServerConfig(root: string): Promise<ResolvedMockServerConfig> {
  const base: DevServerOptions = {
    mockServer: { path: 'mocks' },
    api: { serviceDiscoveryUrl: '' },
  };

  try {
    const { config } = await importConfig<DevServerConfigOverrides, DevServerConfigModule>(
      'dev-server.config',
      {
        baseDir: root,
        script: {
          // Config factories receive the same runtime shape as ordinary development serving.
          resolve: async (module) => {
            const exported = module.default;
            // Factory configs may derive settings from the supplied base configuration.
            if (typeof exported === 'function') {
              return (
                (await exported(
                  { command: 'serve', environment: 'local', mode: 'development', root },
                  { base },
                )) ?? {}
              );
            }
            return exported ?? {};
          },
        },
      },
    );

    return {
      path: config.mockServer?.path ?? base.mockServer?.path,
      port: config.mockServer?.port,
      host: config.mockServer?.host,
      seed: config.mockServer?.seed,
    };
  } catch (error) {
    // An absent config is a supported convention-only setup; import and evaluation failures are not.
    if (error instanceof FileNotFoundError) {
      return {};
    }
    throw error;
  }
}

export default loadMockServerConfig;
