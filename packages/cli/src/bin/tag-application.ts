import { chalk } from './utils/format.js';
import { Spinner } from './utils/spinner.js';
import { resolveAppPackage, resolveAppKey } from '../lib/app-package.js';
import { appRegistered, validateToken, tagAppBundle } from './utils/app-api.js';

export const tagApplication = async (options: { tag: string; version: string }) => {
    const { tag, version } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('Tag') });

    const validToken = validateToken();
    if (!validToken) {
        return;
    }

    const pkg = await resolveAppPackage();
    const appKey = resolveAppKey(pkg.packageJson);

    spinner.info(`Tag app "${appKey}" with "${tag}"`);

    spinner.info('Verifying that App is registered');
    const appResponse = await appRegistered(appKey);
    if (!appResponse) {
        return;
    }

    const tagd = await tagAppBundle(tag, appKey, version);

    if (!tagd) {
        return;
    }

    spinner.succeed(
        '✅',
        `App: "${chalk.greenBright(appKey)}"`,
        `Version: "${chalk.greenBright(tagd.version)}"`,
        `Tag: "${chalk.greenBright(tagd.tagName)}"`,
    );
};
