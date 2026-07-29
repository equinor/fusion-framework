import { createCommand } from 'commander';

import devCommand from './dev.command.js';
import serveCommand from './serve.command.js';
import manifestCommand from './manifest.command.js';
import schemaCommand from './schema.command.js';
import buildCommand from './build.command.js';
import packCommand from './pack.command.js';
import uploadCommand from './upload.command.js';
import tagCommand from './tag.command.js';
import publishCommand from './publish.command.js';
import configCommand from './config.command.js';

export const command = createCommand('portal')
  .description('Develop and deploy portal templates')
  .addCommand(devCommand)
  .addCommand(serveCommand)
  .addCommand(manifestCommand)
  .addCommand(schemaCommand)
  .addCommand(buildCommand)
  .addCommand(packCommand)
  .addCommand(uploadCommand)
  .addCommand(tagCommand)
  .addCommand(publishCommand)
  .addCommand(configCommand);

export default command;
