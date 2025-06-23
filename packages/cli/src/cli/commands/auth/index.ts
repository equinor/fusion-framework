import { Command } from 'commander';

import loginCommand from './login.js';
import logoutCommand from './logout.js';
import tokenCommand from './token.js';

export const command = new Command('auth')
  .description('Authenticate with Fusion Framework CLI')
  .addHelpText(
    'after',
    [
      '',
      'Authentication commands for Fusion Framework CLI.',
      '',
      'Use these commands to log in, log out, or acquire tokens for Fusion APIs.',
      '',
      'Examples:',
      '  $ fusion-framework-cli auth login',
      '  $ fusion-framework-cli auth logout',
      '  $ fusion-framework-cli auth token --scope api://my-app/.default',
    ].join('\n'),
  );

command.addCommand(loginCommand, { isDefault: true });
command.addCommand(logoutCommand);
command.addCommand(tokenCommand);

export default command;
