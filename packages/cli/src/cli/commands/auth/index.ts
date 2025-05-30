import { Command } from 'commander';

import loginCommand from './login.js';
import logoutCommand from './logout.js';
import tokenCommand from './token.js';

export const command = new Command('auth').description('Authenticate with Fusion Framework CLI');

command.addCommand(loginCommand, { isDefault: true });
command.addCommand(logoutCommand);
command.addCommand(tokenCommand);

export default command;
