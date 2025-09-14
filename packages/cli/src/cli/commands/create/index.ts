import { createCommand } from 'commander';

import createAppCommand from './app.js';

export const command = createCommand('create')
  .description('Create new Fusion applications and components from templates')
  .addHelpText(
    'after',
    [
      '',
      'The "create" command helps you bootstrap new Fusion applications and components',
      'using predefined templates from the Fusion ecosystem.',
      '',
      'Available templates:',
      '  - app: Create a new Fusion application from the official template',
      '',
      'Examples:',
      '  fusion create app my-new-app',
      '  fusion create app my-new-app --template react',
      '',
    ].join('\n'),
  )
  .addCommand(createAppCommand);

export default command;
