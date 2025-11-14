import { Command } from 'commander';
import chalk from 'chalk';
import { config as loadDotEnv } from 'dotenv';

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/** find cli package.json */
import { readPackageUpSync } from 'read-package-up';

import registerCommands from './commands/index.js';

loadDotEnv();


// Check Node.js version and recommend LTS (22.x)
const MINIMUM_NODE_VERSION = process.env.MINIMUM_NODE_VERSION || '20';
const [major] = process.versions.node.split('.').map(Number);
if (major < Number(MINIMUM_NODE_VERSION)) {
  console.error(
    chalk.red('[ERROR]'),
    `Fusion Framework CLI requires Node.js ${MINIMUM_NODE_VERSION} or higher.`,
  );
  process.exit(1);
}

const RECOMMENDED_NODE_LTS = process.env.RECOMMENDED_NODE_LTS || '22';
if (major !== Number(RECOMMENDED_NODE_LTS)) {
  console.warn(
    chalk.yellow('[WARNING]'),
    `Node.js ${RECOMMENDED_NODE_LTS}.x (LTS) is recommended for best compatibility. You are using Node.js`,
    process.versions.node,
  );
}

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
    '  https://equinor.github.io/fusion-framework/cli/',
  ].join('\n'),
);
program.version(pkg.packageJson.version, '-V, --version', 'CLI version');

registerCommands(program);

/** read action and options and start programs */
program.parse();
