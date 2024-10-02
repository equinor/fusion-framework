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
    service: string;
}) => {
    const { tag, version, env, service } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('Tag') });

    const validToken = validateToken();
    if (!validToken) {
        return;
    }

    const pkg = await resolveAppPackage();
    const appKey = resolveAppKey(pkg.packageJson);

    // if (!['preview', 'latest'].includes(tag)) {
    if (!Object.values(Tags).includes(tag as Tags)) {
        spinner.fail('😞', `Tag must match (${Tags.latest} | ${Tags.preview})`);
        return;
    }

    spinner.info(`Tag app "${appKey}@${version}" with: "${tag}"`);

    spinner.info('Verifying that App is registered');
    const registered = await appRegistered(appKey, env, service);
    if (!registered) {
        return;
    }

    const tagged = await tagAppBundle(tag, appKey, version, env, service);

    if (!tagged) {
        return;
    }

    spinner.succeed(
        '✅',
        `App: "${chalk.greenBright(appKey)}"`,
        `Version: "${chalk.greenBright(tagged.version)}"`,
        `Tag: "${chalk.greenBright(tagged.tagName)}"`,
    );
};
