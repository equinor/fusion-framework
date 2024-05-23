import { chalk } from './utils/format.js';
import { Spinner } from './utils/spinner.js';
import { resolveAppPackage, resolveAppKey } from '../lib/app-package.js';
import { appRegistered, validateToken, tagAppBundle, type FusionEnv } from './utils/app-api.js';

enum Tags {
    preview = 'preview',
    latest = 'latest',
}

export const tagApplication = async (options: {
    tag: keyof typeof Tags;
    version: string;
    env: FusionEnv;
}) => {
    const { tag, version, env } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('Tag') });

    const validToken = validateToken();
    if (!validToken) {
        return;
    }

    const pkg = await resolveAppPackage();
    const appKey = resolveAppKey(pkg.packageJson);

    spinner.info(`Tag app "${appKey}" with "${tag}"`);

    if (!Object.values(Tags).includes(tag as Tags)) {
        spinner.fail('😞', `Tag must match (${Tags.latest} | ${Tags.preview})`);
        return;
    }

    spinner.info('Verifying that App is registered');
    const appResponse = await appRegistered(appKey, env);
    if (!appResponse) {
        return;
    }

    const tagd = await tagAppBundle(tag, appKey, version, env);

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
