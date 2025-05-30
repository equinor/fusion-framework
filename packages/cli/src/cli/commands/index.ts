import type { Command } from 'commander';
import appCommand from './app';
import authCommands from './auth';
import discoCommand from './disco';
import portalCommand from './portal';

export default (program: Command) => {
  program.addCommand(appCommand);
  program.addCommand(authCommands);
  program.addCommand(discoCommand);
  program.addCommand(portalCommand);
};
