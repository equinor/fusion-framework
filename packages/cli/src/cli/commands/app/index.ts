import { createCommand } from 'commander';

import buildCommand from './build.js';
import packCommand from './pack.js';
import checkCommand from './check.js';
import uploadCommand from './upload.js';
import configCommand from './config.js';
import tagCommand from './tag.js';
import devCommand from './dev.js';
import manifestCommand from './manifest.js';
import publishCommand from './publish.js';

// @todo - remove in next major version v12
import './alias.js';

export const command = createCommand('app')
  .description('Develop and deploy Fusion applications')
  .addCommand(buildCommand)
  .addCommand(packCommand)
  .addCommand(checkCommand)
  .addCommand(uploadCommand)
  .addCommand(configCommand)
  .addCommand(tagCommand)
  .addCommand(devCommand)
  .addCommand(manifestCommand)
  .addCommand(publishCommand);

export default command;
