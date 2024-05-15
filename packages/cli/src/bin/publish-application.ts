import { dirname } from 'node:path';
import { chalk } from './utils/format.js';
import { Spinner } from './utils/spinner.js';
import { resolveAppPackage } from '../lib/app-package.js';

import { HttpClient } from '@equinor/fusion-framework-module-http/client';

import { bundleApplication } from './bundle-application.js';

export const publishApplication = async (options: { tag: string }) => {
    const { tag } = options;

    const client = new HttpClient('https://fusion-s-apps-ci.azurewebsites.net/');

    const spinner = Spinner.Global({ prefixText: chalk.dim('Publish') });
    spinner.info('Verifying FUSION_TOKEN env exists');
    if (!process?.env?.FUSION_TOKEN) {
        spinner.fail('😞', chalk.yellowBright('Missing FUSION_TOKEN env variable'));
        return;
    }
    spinner.succeed('Token found');

    client.json('apps/one-equinor').then((response: unknown) => {
        console.log('Fishy', response);
    });

    spinner.start('resolve application package');
    const pkg = await resolveAppPackage();
    spinner.succeed();

    spinner.info(
        '📦',
        chalk.yellowBright([pkg.packageJson.name, pkg.packageJson.version].join('@') + `@${tag}`),
    );

    const packageDirname = dirname(pkg.path);
    spinner.info(`🏠 ${chalk.blueBright(packageDirname)}`);

    const viteBuild = bundleApplication({ archive: 'app-bundle.zip', outDir: 'dist' });

    return {
        viteBuild,
    };
};
