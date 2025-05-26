import { createCommand } from 'commander';

import devCommand from './dev.js';
import manifestCommand from './manifest.js';
import schemaCommand from './schema.js';
import buildCommand from './build.js';
import packCommand from './pack.js';
import uploadCommand from './upload.js';
import tagCommand from './tag.js';
import publishCommand from './publish.js';

export const command = createCommand('portal')
  .description('Develop and deploy portal templates')
  .addCommand(devCommand)
  .addCommand(manifestCommand)
  .addCommand(schemaCommand)
  .addCommand(buildCommand)
  .addCommand(packCommand)
  .addCommand(uploadCommand)
  .addCommand(tagCommand)
  .addCommand(publishCommand);

export default command;
