import { createCommand } from 'commander';
import { ConsoleLogger, buildPortal } from '@equinor/fusion-framework-cli/bin';

export const command = createCommand('build')
  .description('Build the Fusion portal from a manifest file with environment-specific settings.')
  .addHelpText(
    'after',
    [
      'Builds the Fusion portal using a manifest file and environment-specific configuration.',
      '',
      'If no manifest is provided, the command will search for a default portal.manifest.[ts|js|json] in the current directory.',
      'You can use environment variables to customize the build process (e.g., NODE_ENV, FUSION_PORTAL_*).',
      '',
      'Options:',
      '  -d, --debug     Enable debug mode for verbose logging',
      '',
      'Examples:',
      '  $ fusion-framework-cli portal build',
      '  $ fusion-framework-cli portal build portal.manifest.prod.ts --debug',
      '',
    ].join('\n'),
  )
  .option('-d, --debug', 'Enable debug mode for verbose logging', false)
  .argument(
    '[manifest]',
    'Manifest build file to use for building (e.g., portal.manifest[.env]?.[ts,js,json])',
  )
  .action(async (manifest, opt) => {
    const log = new ConsoleLogger('portal:build', { debug: opt.debug });
    await buildPortal({ log, manifest });
  });

export default command;
