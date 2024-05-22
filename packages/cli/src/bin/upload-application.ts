import { Spinner } from './utils/spinner.js';
import { chalk } from './utils/format.js';
import { resolveAppPackage, resolveAppKey } from '../lib/app-package.js';
import { uploadAppBundle, appRegistered, validateToken } from './utils/app-api.js';

export const uploadApplication = async (options: { bundle: string }) => {
    const { bundle } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('Upload') });

    const validToken = validateToken();
    if (!validToken) {
        return;
    }

    const pkg = await resolveAppPackage();
    const appKey = resolveAppKey(pkg.packageJson);

    spinner.info('Verifying App is registered');
    const appResponse = await appRegistered(appKey);
    if (!appResponse) {
        return;
    }

    /* Upload app bundle */
    spinner.info(`Uploading appkey: ${chalk.yellowBright(appKey)}`);
    spinner.info(`Uploading bundle ${chalk.yellowBright(bundle)}`);
    const uploadedBundle = await uploadAppBundle(appKey, bundle);
    if (!uploadedBundle) {
        return;
    }

    // console.log(chalk.dim(JSON.stringify(uploadedBundle, undefined, 2)));

    spinner.succeed(
        '✅',
        `Uploaded app: "${chalk.greenBright(appKey)}"`,
        `Version: "${chalk.greenBright(uploadedBundle.version)}"`,
    );
};
