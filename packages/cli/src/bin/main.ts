/** find cli package.json */
import { fileURLToPath } from 'node:url';
import { readPackageUpSync } from 'read-pkg-up';
const pkg = readPackageUpSync({ cwd: fileURLToPath(import.meta.url) });
if (!pkg) {
    throw Error('failed to find program root');
}

import { Command } from 'commander';

const program = new Command();
program.name(pkg.packageJson.name);
program.description(pkg.packageJson.description ?? 'CLI for Fusion Framework');
program.version(pkg.packageJson.version);

/** add app commands */
import app from './main.app.js';
app(program);

/** read action and options and start programs */
program.parse();
