/**
 * This file defines deprecated command aliases to support a smoother transition to v11.
 * Each alias maps an old "build-*" command to its new equivalent, providing warnings and guidance for users.
 * These aliases help maintain backward compatibility and inform users about updated command usage.
 */

import chalk from 'chalk';

import packCommand, { DEFAULT_ARCHIVE } from './pack.js';
packCommand.alias('build-pack').hook('preAction', (thisCommand) => {
  if (process.argv[3] === 'build-pack') {
    console.warn(
      chalk.bgRedBright.bold('The command "build-pack" is deprecated. Please use "pack" instead.'),
    );
    if (!thisCommand.getOptionValue('archive')) {
      thisCommand.setOptionValue('archive', DEFAULT_ARCHIVE);
    }
  }
});

import uploadCommand from './upload.js';
uploadCommand.alias('build-upload').hook('preAction', (thisCommand) => {
  if (process.argv[3] === 'build-upload') {
    console.warn(
      chalk.bgRedBright.bold(
        'The command "build-upload" is deprecated. Please use "upload" instead.',
      ),
    );
    if (thisCommand.getOptionValue('service')) {
      throw new Error('The --service option is deprecated. Please use --env instead.');
    }
    const bundle = thisCommand.getOptionValue('bundle') ?? DEFAULT_ARCHIVE;
    process.argv[4] = bundle;
  }
});

import manifestCommand from './manifest.js';
manifestCommand.alias('build-manifest').hook('preAction', () => {
  if (process.argv[3] === 'build-manifest') {
    console.warn(
      chalk.bgRedBright.bold(
        'The command "build-manifest" is deprecated. Please use "manifest" instead.',
      ),
    );
  }
});

import publishCommand from './publish.js';
publishCommand.alias('build-publish').hook('preAction', (thisCommand) => {
  if (process.argv[3] === 'build-publish') {
    console.warn(
      chalk.bgRedBright.bold(
        'The command "build-publish" is deprecated. Please use "publish" instead.',
      ),
    );
  }
  if (thisCommand.getOptionValue('service')) {
    throw new Error('The --service option is deprecated. Please use --env instead.');
  }
});
