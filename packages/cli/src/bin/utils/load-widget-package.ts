import { dirname } from 'node:path';

import { Spinner } from './spinner.js';

import { resolveWidgetPackage } from '../../lib/widget-package.js';
import { chalk } from './format.js';

export const loadWidgetPackage = async () => {
    const spinner = Spinner.Current;
    spinner.start('resolve application package');
    const pkg = await resolveWidgetPackage();
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
