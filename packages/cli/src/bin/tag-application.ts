import { exit } from 'node:process';
import { chalk } from './utils/format.js';
import { Spinner } from './utils/spinner.js';
import { resolveAppPackage, resolveAppKey } from '../lib/app-package.js';
import { isAppRegistered, getEndpointUrl, requireToken, tagAppBundle } from './utils/index.js';
import type { FusionEnv } from './utils/index.js';
import assert from 'node:assert';

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

  if (!Object.values(Tags).includes(tag as Tags)) {
    spinner.fail('😞', `Tag must match (${Tags.latest} | ${Tags.preview})`);
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

    const exist = await isAppRegistered(state.endpoint);
    assert(exist, `${appKey} is not registered`);

    spinner.succeed(`${appKey} is registered`);
  } catch (e) {
    const err = e as Error;
    spinner.fail('🙅‍♂️', chalk.bgRed(err.message));
    throw err;
  }

  try {
    spinner.info(`Tagging "${appKey}@${version}" with: "${tag}"`);
    const state = { endpoint: '' };
    try {
      state.endpoint = await getEndpointUrl(`apps/${appKey}/tags/${tag}`, env, service);
    } catch (e) {
      const err = e as Error;
      throw new Error(
        `Could not get endpoint from service discovery while tagging app. service-discovery status: ${err.message}`,
      );
    }

    const tagged = await tagAppBundle(state.endpoint, version);
    spinner.succeed(
      '✅',
      `Tagged app: "${chalk.greenBright(appKey)}"`,
      `version: "${chalk.greenBright(tagged.version)}"`,
      `with tag: "${chalk.greenBright(tagged.tagName)}"`,
    );
  } catch (e) {
    const err = e as Error;
    spinner.fail('🙅‍♂️', chalk.bgRed(err.message));
    exit(1);
  }
};
