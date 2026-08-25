import type { Command } from 'commander';

import {
  createMockServerCommand,
  type MockServerCommandDefaults,
} from './create-mock-server-command.js';

export type { MockServerCommandDefaults };
export type {
  DevServerMockOptions,
  MockServerDevServerOptions,
} from './dev-server-options.js';

/**
 * Creates the `ffc mock-server` CLI plugin, for a `fusion-cli.config.ts`'s `plugins` array.
 *
 * @param defaults - Overrides for the command's own built-in `--preset`/`--port`/`--host` defaults.
 * @returns A plugin function that registers the `mock-server` command on the CLI program.
 *
 * @example
 * ```ts
 * import { defineFusionCli } from '@equinor/fusion-framework-cli';
 * import mockServerPlugin from '@equinor/fusion-framework-cli-plugin-mock-server';
 *
 * export default defineFusionCli(() => ({
 *   plugins: [mockServerPlugin({ preset: ['fusion'], port: 4010 })],
 * }));
 * ```
 */
export function mockServerPlugin(defaults?: MockServerCommandDefaults): (program: Command) => void {
  return (program: Command): void => {
    program.addCommand(createMockServerCommand(defaults));
  };
}

export default mockServerPlugin;
