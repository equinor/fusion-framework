import type { Command } from 'commander';
import appCommand from './app/index.js';
import authCommands from './auth/index.js';
import createCommand from './create/index.js';
import discoCommand from './disco/index.js';
import portalCommand from './portal/index.js';

export default (program: Command) => {
  program.addCommand(appCommand);
  program.addCommand(authCommands);
  program.addCommand(createCommand);
  program.addCommand(discoCommand);
  program.addCommand(portalCommand);
};
