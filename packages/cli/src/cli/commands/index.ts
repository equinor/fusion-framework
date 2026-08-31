import type { Command } from 'commander';
import appCommand from './app/index.js';
import authCommands from './auth/index.js';
import createCommand from './create/index.js';
import discoCommand from './disco/index.js';
import portalCommand from './portal/index.js';
import { registerOptionalMockServerCommand } from './register-optional-mock-server-command.js';
import { loadPlugins } from '../plugins/load-plugins.js';

/**
 * Registers all built-in CLI commands and optional plugins on the Commander program.
 *
 * Built-in command groups: `app`, `auth`, `create`, `disco`, `portal`, `mock-server`.
 * Configured plugins load before the optional `mock-server` fallback so an explicit
 * `mockServerPlugin()` registration can retain its app-specific defaults. When no configured
 * plugin owns that command, it delegates to the installed plugin package or registers an
 * install-hint stub.
 *
 * @param program - The Commander program instance to register commands on.
 */
export default async (program: Command) => {
  program.addCommand(appCommand);
  program.addCommand(authCommands);
  program.addCommand(createCommand);
  program.addCommand(discoCommand);
  program.addCommand(portalCommand);

  // Load optional plugins from config file
  // Config is resolved from process.cwd() or package.json root
  await loadPlugins(program);

  await registerOptionalMockServerCommand(program);
};
