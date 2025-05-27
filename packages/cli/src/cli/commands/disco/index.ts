import { createCommand } from 'commander';

import resolveCommand from './resolve.js';

const command = createCommand('disco').description('Service discovery operations');

command.addCommand(resolveCommand);

export default command;
