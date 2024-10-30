import AdmZip from 'adm-zip';

import { dirname, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

import { chalk, formatByteSize, formatPath } from './utils/format.js';
import { Spinner } from './utils/spinner.js';
import { buildApplication } from './build-application.js';
import { createBuildManifest } from './create-export-manifest.js';
import { fileExistsSync } from '../lib/utils/file-exists.js';

export const bundleApplication = async (options: { outDir: string; archive: string }) => {
    const { outDir, archive } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('pack') });

    spinner.start('build application');
    const { pkg } = await buildApplication({ outDir });
    spinner.succeed();

    spinner.start('generate manifest');
    const buildManifest = await createBuildManifest({ outputFile: `${outDir}/app-manifest.json` });
    spinner.succeed('generated manifest:', '\n' + JSON.stringify(buildManifest, undefined, 2));

    const bundle = new AdmZip();

    bundle.addLocalFolder(outDir);
    spinner.info(`added ./${outDir}`);

    const appDir = dirname(pkg.path);

    /* Files to add to zip package */
    const addFiles = ['package.json', 'LICENSE.md', 'README.md', 'CHANGELOG.md'];
    addFiles.forEach((file) => {
        const filePath = resolve(appDir, file);
        if (fileExistsSync(filePath)) {
            bundle.addLocalFile(filePath);
            spinner.info(`added ${file}`);
        } else {
            spinner.warn(`missing ${file}`);
        }
    });

    spinner.start('compressing content');
    if (!fileExistsSync(dirname(archive))) {
        await mkdir(dirname(archive), { recursive: true });
    }

    bundle.writeZip(archive);
    spinner.succeed(
        'Bundle complete',
        formatPath(archive, { relative: true }),
        formatByteSize(archive),
    );
};
