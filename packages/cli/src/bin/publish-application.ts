import { chalk } from './utils/format.js';
import { Spinner } from './utils/spinner.js';
import { bundleApplication } from './bundle-application.js';
import { resolveAppPackage, resolveAppKey } from '../lib/app-package.js';

import {
    isAppRegistered,
    getEndpointUrl,
    requireToken,
    tagAppBundle,
    uploadAppBundle,
} from './utils/index.js';
import type { FusionEnv } from './utils/index.js';

import { exit } from 'node:process';

export const publishApplication = async (options: {
    tag: string;
    env: FusionEnv;
    service: string;
}) => {
    const { tag, env, service } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('Publish') });

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
                `Could not get endpoint from service discovery while verifying app is registered. service-discovery status: ${err.message}`,
            );
        }

        await isAppRegistered(state.endpoint, appKey);
        spinner.succeed(`${appKey} is registered`);
    } catch (e) {
        const err = e as Error;
        spinner.fail('🙅‍♂️', chalk.bgRed(err.message));
        exit(1);
    }

    const bundle = 'app-bundle.zip';

    /* Zip app bundle */
    spinner.info('Creating zip bundle');

    await bundleApplication({
        archive: bundle,
        outDir: 'dist',
    });

    const state = {
        uploadedBundle: { version: '' },
        endpoint: '',
    };

    spinner.info(`Publishing app: "${appKey}" with tag: "${tag}"`);

    /* Upload app bundle */
    try {
        spinner.info(
            `Uploading bundle ${chalk.yellowBright(bundle)} to appKey ${chalk.yellowBright(appKey)}`,
        );

        try {
            state.endpoint = await getEndpointUrl(`bundles/apps/${appKey}`, env, service);
        } catch (e) {
            const err = e as Error;
            throw new Error(
                `Could not get endpoint from service discovery while uploading app bundle. service-discovery status: ${err.message}`,
            );
        }

        spinner.info(`Posting bundle to => ${state.endpoint}`);

        state.uploadedBundle = await uploadAppBundle(state.endpoint, bundle);

        spinner.succeed(
            '✅',
            `Uploaded bundle: "${chalk.greenBright(bundle)}" with version: ${chalk.greenBright(state.uploadedBundle.version)}"`,
        );
    } catch (e) {
        const err = e as Error;
        spinner.fail('🙅‍♂️', chalk.bgRed(err.message));
        exit(1);
    }

    try {
        spinner.info(`Tagging ${state.uploadedBundle.version} with ${tag}`);

        try {
            state.endpoint = await getEndpointUrl(`apps/${appKey}/tags/${tag}`, env, service);
        } catch (e) {
            const err = e as Error;
            throw new Error(
                `Could not get endpoint from service discovery while tagging app. service-discovery status: ${err.message}`,
            );
        }

        const tagged = await tagAppBundle(state.endpoint, state.uploadedBundle.version);
        spinner.succeed(
            '✅',
            `Tagged version ${chalk.greenBright(tagged.version)} with ${chalk.greenBright(tagged.tagName)}`,
        );
    } catch (e) {
        const err = e as Error;
        spinner.fail('🙅‍♂️', chalk.bgRed(err.message));
        exit(1);
    }

    spinner.succeed(
        '⭐️',
        `Published app: "${chalk.greenBright(appKey)}" version: "${chalk.greenBright(state.uploadedBundle.version)}" with tagg: "${chalk.greenBright(tag)}"`,
    );
};
