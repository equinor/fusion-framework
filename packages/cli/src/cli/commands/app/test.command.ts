import { createCommand } from 'commander';

import { ConsoleLogger, testApplication } from '@equinor/fusion-framework-cli/bin';

/**
 * CLI command: `test`
 *
 * Runs the application's own Vitest suite with its manifest, config, and module-configurator
 * resolved and wired up automatically — no per-test-file fixture setup required.
 *
 * Usage:
 *   $ ffc app test [options]
 *
 * Options:
 *   --manifest <path>    Path to the app manifest file (app.manifest[.env]?.[ts,js,json])
 *   --config <path>      Path to the app config file (app.config[.env]?.[ts,js,json])
 *   --configure <path>   Path to the app's module-configurator file (default: src/config.*)
 *   --watch              Re-run tests on file changes instead of exiting after one run
 *   --debug              Enable debug mode
 *
 * Example:
 *   $ ffc app test
 *   $ ffc app test --watch
 *   $ ffc app test --manifest ./app.manifest.local.ts --config ./app.config.ts
 *
 * @see testApplication for implementation details
 */
export const command = createCommand('test')
  .description("Run the application's own test suite with manifest/config/configure resolved.")
  .addHelpText(
    'after',
    [
      '',
      "Runs the application's own installed Vitest, with its manifest, config, and",
      'module-configurator resolved the same way `ffc app build`/`ffc app dev` do, and exposed',
      "to `@equinor/fusion-framework-react-app/vitest`'s `test` with zero per-test wiring.",
      '',
      'Examples:',
      '  $ ffc app test',
      '  $ ffc app test --watch',
      '  $ ffc app test --manifest ./app.manifest.local.ts --config ./app.config.ts',
    ].join('\n'),
  )
  .option('--debug', 'Enable debug mode', !!process.env.RUNNER_DEBUG)
  .option('--manifest <path>', 'Path to the app manifest file (app.manifest[.env]?.[ts,js,json])')
  .option('--config <path>', 'Path to the app config file (app.config[.env]?.[ts,js,json])')
  .option(
    '--configure <path>',
    "Path to the app's module-configurator file (default: src/config.*)",
  )
  .option('--watch', 'Re-run tests on file changes instead of exiting after one run', false)
  .action(async (options) => {
    const log = new ConsoleLogger('app:test', { debug: options.debug });

    log.start('Running application test suite...');
    await testApplication({
      log,
      manifest: options.manifest,
      config: options.config,
      configure: options.configure,
      watch: options.watch,
    });
    log.succeed('Application test suite finished.');
  });

export default command;
