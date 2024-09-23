import nodeFs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import semverValid from 'semver/functions/valid.js';

import { chalk, formatPath } from './utils/format.js';
import { Spinner } from './utils/spinner.js';

import { loadPackage } from './utils/load-package.js';
import { loadAppConfig } from './utils/load-app-config.js';
import { publishAppConfig, validateToken, type FusionEnv } from './utils/app-api.js';
import { ConfigExecuterEnv } from '../lib/utils/config.js';
import { resolveAppKey } from '../lib/app-package.js';

export const createExportConfig = async (options: {
    command?: ConfigExecuterEnv['command'];
    configFile?: string;
    publish?: string;
    outputFile?: string;
    env: FusionEnv;
    service: string;
}) => {
    const { command = 'build', outputFile, configFile, publish, env, service } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('config') });

    const pkg = await loadPackage();
    const appKey = resolveAppKey(pkg.packageJson);

    const appEnv: ConfigExecuterEnv = {
        command,
        mode: process.env.NODE_ENV ?? 'development',
        root: pkg.root,
    };

    const { config } = await loadAppConfig(appEnv, pkg, {
        file: configFile,
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

    if (publish) {
        spinner.info('Publishing config');

        const validToken = validateToken();
        if (!validToken) {
            return;
        }

        const version = publish === 'current' ? pkg.packageJson.version : publish;
        if (!version || (!semverValid(version) && !['latest', 'preview'].includes(version))) {
            spinner.fail(
                '🙅‍♂️',
                'Can not publish config to invalid version',
                chalk.redBright(version),
                '',
            );
            return;
        }

        const published = await publishAppConfig(appKey, version, config, env, service);
        if (published) {
            spinner.succeed('✅', 'Published config to version', chalk.yellowBright(version));
        }
    }

    return config;
};

export default createExportConfig;
