import type { Command } from 'commander';

import { resolveOptionalPlugin } from '../plugins/resolve-optional-plugin.js';

// npm package name of the optional `ffc mock-server` plugin
const MOCK_SERVER_PLUGIN_PACKAGE = '@equinor/fusion-framework-cli-plugin-mock-server';

/**
 * Registers `ffc mock-server` without requiring it to be declared in `fusion-cli.config.ts`.
 *
 * Delegates to `@equinor/fusion-framework-cli-plugin-mock-server` when it's installed;
 * otherwise registers a stub command that tells the user how to install it. Either way,
 * `ffc mock-server --help` (and the top-level command list) show the command, whether or
 * not the optional plugin package is present.
 *
 * @param program - The Commander program instance to register the command on.
 * @param packageName - Overridable for testing; defaults to the real plugin package name.
 */
export async function registerOptionalMockServerCommand(
  program: Command,
  packageName: string = MOCK_SERVER_PLUGIN_PACKAGE,
): Promise<void> {
  // Preserve a configured plugin's ownership of the command and its app-specific defaults.
  const hasConfiguredCommand = program.commands.some((command) => command.name() === 'mock-server');
  // Existing ownership means the optional fallback has nothing to register.
  if (hasConfiguredCommand) {
    return;
  }

  const registerPlugin = await resolveOptionalPlugin(packageName);
  // installed: delegate straight to the plugin's own command, otherwise fall through to the install-hint stub below
  if (registerPlugin) {
    registerPlugin(program);
    return;
  }

  program
    .command('mock-server')
    .description('Serve OpenAPI-fake responses over HTTP (requires an additional package)')
    .allowUnknownOption()
    .action(() => {
      console.error(
        `"mock-server" requires ${packageName}, which isn't installed.\n\nInstall it with:\n\n  pnpm add -D ${packageName}\n`,
      );
      process.exitCode = 1;
    });
}
