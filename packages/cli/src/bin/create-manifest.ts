import { writeFile } from 'fs/promises';

import { chalk, formatPath } from './utils/format.js';
import { Spinner } from './utils/spinner.js';

import { loadAppManifest } from './utils/load-manifest.js';

import { ConfigExecuterEnv } from '../lib/utils/config.js';
import { loadPackage } from './utils/load-package.js';

export const createManifest = async (options?: {
    command?: ConfigExecuterEnv['command'];
    configFile?: string;
    outputFile?: string;
}) => {
    const { command = 'build', outputFile } = options ?? {};

    const spinner = Spinner.Global({ prefixText: chalk.dim('manifest') });

    const pkg = await loadPackage();

    const env: ConfigExecuterEnv = {
        command,
        mode: process.env.NODE_ENV ?? 'development',
        root: pkg.root,
    };

    const { manifest } = await loadAppManifest(env, pkg, {
        file: options?.configFile,
    });

    if (outputFile) {
        spinner.start(`outputting manifest to ${formatPath(outputFile)}`);
        try {
            writeFile(outputFile, JSON.stringify(manifest));
            spinner.succeed();
        } catch (err) {
            spinner.fail();
            throw err;
        }
    } else {
        console.log(manifest);
    }
};

export default createManifest;
