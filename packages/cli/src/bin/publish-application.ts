import { chalk } from './utils/format.js';
import { Spinner } from './utils/spinner.js';
import { resolveAppPackage, resolveAppKey } from '../lib/app-package.js';
import { uploadBundle, appRegistered, validateToken, tagBundle } from './utils/app-api.js';

export const publishApplication = async (options: { tag: string }) => {
    const { tag } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('Publish') });

    const validToken = validateToken();
    if (!validToken) {
        return;
    }

    const pkg = await resolveAppPackage();
    const appKey = resolveAppKey(pkg.packageJson);

    spinner.info(`Publishing appkey: ${appKey}`);

    spinner.info('Verifying App is registered');
    const appResponse = await appRegistered(appKey);
    if (!appResponse) {
        return;
    }

    /* Zip and upload  app bundle */
    spinner.info('Create bundle and publish');
    const uploadedBundle = await uploadBundle(appKey);
    if (!uploadedBundle) {
        return;
    }

    spinner.info(`Tag bundle with: ${tag}`);

    const tagd = await tagBundle(tag, appKey, uploadedBundle.version);

    if (!tagd) {
        return;
    }

    spinner.succeed(
        '✅',
        `Published app: "${appKey}"`,
        `With version: "${tagd.version}"`,
        `Tag: "${tagd.tagName}"`,
    );
};
