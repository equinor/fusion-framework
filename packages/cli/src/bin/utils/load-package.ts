import { dirname } from 'node:path';

import { Spinner } from './spinner.js';

import { resolveAppPackage } from '../../lib/app-package.js';
import { chalk } from './format.js';

export const loadPackage = async () => {
    const spinner = Spinner.Current;
    spinner.start('resolve application package');
    const pkg = await resolveAppPackage();
    spinner.succeed();

    spinner.info(
        '📦',
        chalk.yellowBright([pkg.packageJson.name, pkg.packageJson.version].join('@')),
    );

    const packageDirname = dirname(pkg.path);
    spinner.info(`🏠 ${chalk.blueBright(packageDirname)}`);

    return {
        ...pkg,
        root: packageDirname,
    };
};
