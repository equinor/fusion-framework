import nodeFs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import semverValid from 'semver/functions/valid.js';

import { chalk, formatPath } from './utils/format.js';
import { Spinner } from './utils/spinner.js';

import {
    getEndpointUrl,
    loadAppConfig,
    loadPackage,
    isAppRegistered,
    requireToken,
    publishAppConfig,
} from './utils/index.js';
import type { FusionEnv } from './utils/index.js';

import { ConfigExecuterEnv } from '../lib/utils/config.js';
import { resolveAppKey } from '../lib/app-package.js';
import { exit } from 'node:process';
import assert from 'node:assert';

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
        spinner.info('Preparing to publishing config');

        /* Make sure version is valid */
        const version = publish === 'current' ? pkg.packageJson.version : publish;
        if (!version || (!semverValid(version) && !['latest', 'preview'].includes(version))) {
            spinner.fail(
                '🙅‍♂️',
                'Can not publish config to invalid version',
                chalk.redBright(version),
                '',
            );
            exit(1);
        }

        /** make sure user has a valid token */
        try {
            spinner.info('Validating FUSION_TOKEN');

            // make sure token exist
            requireToken();

            // call service discovery with token, will throw error if failed
            await getEndpointUrl('apps', env, '');

            spinner.succeed('Found valid FUSION_TOKEN');
        } catch (e) {
            const err = e as Error;
            spinner.fail(chalk.bgRed(err.message));
            exit(1);
        }

        try {
            spinner.info('Verifying that App is registered');

            const state = { endpoint: '' };
            try {
                state.endpoint = await getEndpointUrl(`apps/${appKey}`, env, service);
            } catch (e) {
                const err = e as Error;
                throw new Error(
                    `Could not get endpoint from service discovery while verifying app. service-discovery status: ${err.message}`,
                );
            }

            const exist = await isAppRegistered(state.endpoint);
            assert(exist, `${appKey} is not registered`);
            spinner.succeed(`${appKey} is registered`);
        } catch (e) {
            const err = e as Error;
            spinner.fail('🙅‍♂️', chalk.bgRed(err.message));
            throw err;
        }

        try {
            spinner.info(`Publishing config to "${appKey}@${version}"`);

            const state = { endpoint: '' };
            try {
                state.endpoint = await getEndpointUrl(
                    `apps/${appKey}/builds/${version}/config`,
                    env,
                    service,
                );
            } catch (e) {
                const err = e as Error;
                throw new Error(
                    `Could not get endpoint from service discovery while publishig config. service-discovery status: ${err.message}`,
                );
            }

            await publishAppConfig(state.endpoint, appKey, config);
            spinner.succeed('✅', 'Published config to version', chalk.yellowBright(version));
        } catch (e) {
            const err = e as Error;
            spinner.fail('🙅‍♂️', chalk.bgRed(err.message));
            exit(1);
        }
    }

    return config;
};

export default createExportConfig;
