import { existsSync, readFileSync } from 'node:fs';
import semverValid from 'semver/functions/valid.js';

import { chalk } from './utils/format.js';
import { Spinner } from './utils/spinner.js';

import {
    getEndpointUrl,
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

export const uploadExportConfig = async (options: {
    command?: ConfigExecuterEnv['command'];
    configFile: string;
    version: string;
    env: FusionEnv;
    service: string;
}) => {
    const { configFile, version: pubVersion, env, service } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('config') });

    const pkg = await loadPackage();
    const appKey = resolveAppKey(pkg.packageJson);

    if (!existsSync(`${configFile}`)) {
        throw new Error(`Config file ${configFile} does not exist`);
    }

    const config = JSON.parse(readFileSync(`${configFile}`, 'utf8'));

    spinner.info('Preparing to publishing config');

    /* Make sure version is valid */
    const version = pubVersion === 'current' ? pkg.packageJson.version : pubVersion;
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
};

export default uploadExportConfig;
