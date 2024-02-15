import AdmZip from 'adm-zip';

import { dirname, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

import { loadPackage } from './utils/load-package.js';
import { chalk, formatByteSize, formatPath } from './utils/format.js';
import { Spinner } from './utils/spinner.js';
import { buildApplication } from './build-application.js';
import createExportManifest from './create-export-manifest.js';
import { fileExistsSync } from '../lib/utils/file-exists.js';

export const bundleApplication = async (options: {
    outDir: string;
    archive: string;
    outputFileName: string;
}) => {
    const { outDir, archive, outputFileName } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('pack') });

    const pkg = await loadPackage();

    spinner.start('build application');
    await buildApplication({ outDir, outputFileName });
    spinner.succeed();

    spinner.start('generate manifest');
    const manifest = await createExportManifest({ outputFile: `${outDir}/app-manifest.json` });
    spinner.succeed();
    console.log(chalk.dim(JSON.stringify(manifest, undefined, 2)));

    const bundle = new AdmZip();

    bundle.addLocalFile(pkg.path);
    spinner.info(`added ./package.json`);

    bundle.addLocalFolder(outDir);
    spinner.info(`added ./${outDir}`);

    const licenseFile = resolve(pkg.path, 'LICENSE.md');
    if (fileExistsSync(licenseFile)) {
        bundle.addLocalFile(licenseFile);
        spinner.info(`added ${licenseFile}`);
    } else {
        spinner.warn(`missing ${licenseFile}`);
    }

    const readmeFile = resolve(pkg.path, 'README.md');
    if (fileExistsSync(readmeFile)) {
        bundle.addLocalFile(readmeFile);
        spinner.info(`added ${readmeFile}`);
    } else {
        spinner.warn(`missing ${readmeFile}`);
    }

    spinner.start('compressing content');
    if (!fileExistsSync(dirname(archive))) {
        await mkdir(dirname(archive), { recursive: true });
    }
    bundle.writeZip(archive);

    spinner.info(formatPath(archive), formatByteSize(archive));

    spinner.succeed();
};
