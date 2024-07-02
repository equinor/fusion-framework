import { chalk } from './utils/format.js';
import { Spinner } from './utils/spinner.js';
import { bundleApplication } from './bundle-application.js';
import { resolveAppPackage, resolveAppKey } from '../lib/app-package.js';

import {
    uploadAppBundle,
    appRegistered,
    validateToken,
    tagAppBundle,
    type FusionEnv,
} from './utils/app-api.js';

export const publishApplication = async (options: {
    tag: string;
    env: FusionEnv;
    service: string;
}) => {
    const { tag, env, service } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('Publish') });

    const validToken = validateToken();
    if (!validToken) {
        return;
    }

    const pkg = await resolveAppPackage();
    const appKey = resolveAppKey(pkg.packageJson);

    spinner.info(`Publishing app: "${appKey}" with tag: "${tag}"`);

    spinner.info('Verifying that App is registered in api.');
    const appResponse = await appRegistered(appKey, env, service);
    if (!appResponse) {
        return;
    }

    /* Zip app bundle */
    spinner.info('Create bundle');
    await bundleApplication({
        archive: 'app-bundle.zip',
        outDir: 'dist',
    });

    spinner.info('Uploading bundle');
    const uploadedBundle = await uploadAppBundle(appKey, 'app-bundle.zip', env, service);
    if (!uploadedBundle) {
        return;
    }

    spinner.info(`Tag app bundle with: ${tag}`);
    const tagd = await tagAppBundle(tag, appKey, uploadedBundle.version, env, service);

    if (!tagd) {
        return;
    }

    spinner.succeed(
        '✅',
        `Published app: "${chalk.greenBright(appKey)}"`,
        `With version: "${chalk.greenBright(tagd.version)}"`,
        `Tag: "${chalk.greenBright(tagd.tagName)}"`,
    );
};
