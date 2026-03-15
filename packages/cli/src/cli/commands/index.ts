import type { Command } from 'commander';
import appCommand from './app/index.js';
import authCommands from './auth/index.js';
import createCommand from './create/index.js';
import discoCommand from './disco/index.js';
import portalCommand from './portal/index.js';
import { loadPlugins } from '../plugins/loader.js';

/**
 * Registers all built-in CLI commands and optional plugins on the Commander program.
 *
 * Built-in command groups: `app`, `auth`, `create`, `disco`, `portal`.
 * After registering built-in commands, loads any plugins declared in the
 * project's `fusion-cli.config` file.
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
};
