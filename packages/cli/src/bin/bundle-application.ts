import AdmZip from 'adm-zip';

import { resolve } from 'node:path';

import { loadPackage } from './utils/load-package.js';
import { chalk, formatByteSize, formatPath } from './utils/format.js';
import { Spinner } from './utils/spinner.js';
import { buildApplication } from './build-application.js';
import createManifest from './create-manifest.js';
import { fileExistsSync } from '../lib/utils/file-exists.js';

export const bundleApplication = async (options: { outDir: string; archive: string }) => {
    const { outDir, archive } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('pack') });

    const pkg = await loadPackage();

    spinner.start('build application');
    await buildApplication({ outDir });
    spinner.succeed();

    spinner.start('generate manifest');
    const manifest = await createManifest({ outputFile: `${outDir}-app-manifest.json` });
    spinner.succeed();
    console.log(chalk.dim(JSON.stringify(manifest, undefined, 2)));

    spinner.start('compress content');
    const bundle = new AdmZip();
    bundle.addLocalFile(pkg.path);
    spinner.info(`added ./package.json`);

    bundle.addLocalFolder(outDir);
    spinner.info(`added ./${outDir}`);

    const licenseFile = resolve(pkg.path, 'LICENSE');
    if (fileExistsSync(licenseFile)) {
        bundle.addLocalFile(licenseFile);
        spinner.info(`added ${licenseFile}`);
    } else {
        spinner.warn(`missing ./LICENSE`);
    }

    const readmeFile = resolve(pkg.path, 'README');
    if (fileExistsSync(readmeFile)) {
        bundle.addLocalFile(readmeFile);
        spinner.info(`added ${readmeFile}`);
    } else {
        spinner.warn(`missing ./README`);
    }

    bundle.writeZip(archive);

    spinner.info(formatPath(archive), formatByteSize(archive));

    spinner.succeed();
};
