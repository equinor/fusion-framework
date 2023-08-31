import nodeFs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { chalk, formatPath } from './utils/format.js';
import { Spinner } from './utils/spinner.js';

import { loadPackage } from './utils/load-package.js';
import { loadAppConfig } from './utils/load-app-config.js';
import { ConfigExecuterEnv } from '../lib/utils/config.js';

export const createExportConfig = async (options?: {
    command?: ConfigExecuterEnv['command'];
    configFile?: string;
    outputFile?: string;
}) => {
    const { command = 'build', outputFile } = options ?? {};

    const spinner = Spinner.Global({ prefixText: chalk.dim('config') });

    const pkg = await loadPackage();

    const env: ConfigExecuterEnv = {
        command,
        mode: process.env.NODE_ENV ?? 'development',
        root: pkg.root,
    };

    const { config } = await loadAppConfig(env, pkg, {
        file: options?.configFile,
    });

    if (outputFile) {
        spinner.start(`outputting config to ${formatPath(outputFile)}`);
        try {
            const dir = dirname(outputFile).trim();
            if (!nodeFs.existsSync(dirname(outputFile))) {
                nodeFs.mkdirSync(dir, { recursive: true });
            }
            writeFile(outputFile, JSON.stringify(config));
            spinner.succeed();
        } catch (err) {
            spinner.fail();
            throw err;
        }
    } else {
        console.log(config);
    }
    return config;
};

export default createExportConfig;
