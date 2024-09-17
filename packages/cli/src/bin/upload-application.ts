import { exit } from 'node:process';
import { Spinner } from './utils/spinner.js';
import { chalk } from './utils/format.js';
import { resolveAppPackage, resolveAppKey } from '../lib/app-package.js';
import { isAppRegistered, getEndpointUrl, requireToken, uploadAppBundle } from './utils/index.js';
import type { FusionEnv } from './utils/index.js';

export const uploadApplication = async (options: {
    bundle: string;
    env: FusionEnv;
    service: string;
}) => {
    const { bundle, env, service } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('Upload') });

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

    /* get package.json */
    const pkg = await resolveAppPackage();
    const appKey = resolveAppKey(pkg.packageJson);

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

        await isAppRegistered(state.endpoint, appKey);
        spinner.succeed(`${appKey} is registered`);
    } catch (e) {
        const err = e as Error;
        spinner.fail('🙅‍♂️', chalk.bgRed(err.message));
        exit(1);
    }

    /* Upload app bundle */
    try {
        spinner.info(
            `Uploading bundle ${chalk.yellowBright(bundle)} to appKey ${chalk.yellowBright(appKey)}`,
        );

        const endpoint = await getEndpointUrl(`bundles/apps/${appKey}`, env, service);
        if (!endpoint) {
            throw new Error('Could not get endpoint from service discovery');
        }

        spinner.info(`Posting bundle to => ${endpoint}`);

        const uploadedBundle = await uploadAppBundle(endpoint, bundle);

        spinner.succeed(
            '✅',
            `Uploaded app: "${chalk.greenBright(appKey)}"`,
            `Version: "${chalk.greenBright(uploadedBundle.version)}"`,
        );
    } catch (e) {
        const err = e as Error;
        spinner.fail('🙅‍♂️', chalk.bgRed(err.message));
        exit(1);
    }
};
