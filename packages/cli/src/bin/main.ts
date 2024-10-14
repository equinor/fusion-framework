import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/** find cli package.json */
import { readPackageUpSync } from 'read-package-up';
const pkg = readPackageUpSync({ cwd: fileURLToPath(import.meta.url) });
if (!pkg) {
    throw Error('failed to find program root');
}
process.env.CLI_BIN = resolve(
    dirname(pkg.path),
    String(pkg.packageJson.bin!['fusion-framework-cli']),
);

import { Command } from 'commander';

const program = new Command();
program.name(pkg.packageJson.name);
program.description(
    `fusion-framework-cli@${pkg.packageJson.version}.\nCLI for the Fusion Framework`,
);
program.version(pkg.packageJson.version, '-V, --vers', 'CLI version');

/** add app commands */
import app from './main.app.js';
app(program);

/** read action and options and start programs */
program.parse();
