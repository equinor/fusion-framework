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
import createAppCommand from '../create/app.js';

// @todo - remove in next major version v12
import './alias.js';

export const command = createCommand('app')
  .description(
    'Develop, build, configure, and deploy Fusion applications from your workspace root.',
  )
  .addHelpText(
    'after',
    [
      '',
      'The "app" command is your main entry point for managing Fusion applications in this workspace.',
      '',
      'It provides access to subcommands for every stage of the application lifecycle, including development, building, packaging, configuration, deployment, and release management.',
      '',
      'All available subcommands are listed below automatically. For details and options for a specific subcommand, run:',
      '  fusion app <subcommand> --help',
      '',
      'Typical usage:',
      '  - Create new applications from templates with the create subcommand',
      '  - Run and test your app locally with the dev subcommand',
      '  - Build, bundle, and configure your app for deployment',
      '  - Upload, publish, and tag releases to the Fusion App Store',
      '  - Check registration and generate manifests as needed',
      '',
      'This command should be run from your app root directory.',
    ].join('\n'),
  )
  .addCommand(buildCommand)
  .addCommand(packCommand)
  .addCommand(checkCommand)
  .addCommand(uploadCommand)
  .addCommand(configCommand)
  .addCommand(tagCommand)
  .addCommand(devCommand)
  .addCommand(manifestCommand)
  .addCommand(publishCommand)
  .addCommand(createAppCommand('create'));

export default command;
