/**
 * Entry point for the Fusion Framework CLI.
 *
 * This file sets up the CLI program, loads the package metadata, and registers all available commands.
 *
 * Key responsibilities:
 * - Locates the CLI's root directory and package.json using read-package-up.
 * - Sets the CLI_BIN environment variable for internal use.
 * - Initializes the Commander.js program with name, version, and description from package.json.
 * - Registers all CLI commands via the registerCommands function.
 * - Parses process arguments and starts the CLI.
 *
 * Maintenance notes:
 * - To add new commands, update the registerCommands module.
 * - To change CLI metadata (name, version, description), update package.json.
 * - This file should remain minimal and only handle top-level CLI setup logic.
 * - For troubleshooting, ensure the CLI_BIN path is set correctly and that package.json is accessible.
 *
 * For more details, see the Fusion Framework CLI documentation or contact the maintainers.
 */

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/** find cli package.json */
import { readPackageUpSync } from 'read-package-up';

// try to find the package.json of the CLI
const pkg = readPackageUpSync({ cwd: fileURLToPath(import.meta.url) });
if (!pkg) {
  throw Error('failed to find program root');
}

// set the CLI_BIN environment variable to the path of the CLI binary
process.env.CLI_BIN = resolve(
  dirname(pkg.path),
  String(pkg.packageJson.bin?.['fusion-framework-cli']),
);

import { Command } from 'commander';

// Create the main CLI program instance
const program = new Command();
program.name(pkg.packageJson.name);
program.description(
  [
    `${pkg.packageJson.name}@${pkg.packageJson.version}`,
    '',
    'Fusion Framework CLI',
    '',
    'A toolkit for building, packaging, deploying, and managing Fusion applications and portals.',
    '',
    '• Run fusion <command> --help for details on any command.',
    '• For documentation, issues, and source code, visit:',
    `  ${pkg.packageJson.homepage}`,
  ].join('\n'),
);
program.version(pkg.packageJson.version, '-V, --version', 'CLI version');

import registerCommands from './commands';

registerCommands(program);

/** read action and options and start programs */
program.parse();
