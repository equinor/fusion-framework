import { Command } from 'commander';

import { createDevServer } from './create-dev-serve.js';
import { buildApplication } from './build-application.js';

import { formatPath, chalk } from './utils/format.js';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { bundleWidget } from './bundle-widget.js';

export default (program: Command) => {
    const widget = program
        .command('widget')
        .description('Tooling for developing widget build on Fusion Framework');

    widget
        .command('dev')
        .description('Create a development server')
        .option('-p, --port <number>', 'dev-server port')
        .option('-w, --widget <boolean>', 'widget serve')
        .option('-P, --portal <string>', 'fusion portal host')
        .option(
            '-n, --outputFileName, <string>',
            'output file name of package, default widget-bundle',
            'widget-bundle',
        )
        .option(
            '-c, --config <file>',
            `use specified application config, by default search for ${formatPath(
                'app.config.{ts,js,json}',
            )}`,
        )
        .option(
            '    --manifest <file>',
            `use specified manifest, by default search for ${formatPath(
                'app.manifest.config.{ts,js,json}',
            )}`,
        )
        .option(
            '    --vite <file>',
            `use specified Vite config file, by default search for ${formatPath(
                'app.vite.config.{ts,js,json}',
            )}`,
        )
        .option(
            '-F, --framework <string>',
            `application framework to build the application on, supported: [${chalk.yellowBright(
                'react',
            )}]`,
            'react',
        )
        .option('-d, --dev-portal <string>', 'Location of dev-portal you want to use')
        .action(async (opt) => {
            const devPortalPath = opt.devPortal
                ? resolve(join(process.cwd(), opt.devPortal))
                : fileURLToPath(new URL('public', import.meta.url));
            await createDevServer({
                portal:
                    process.env.FUSION_PORTAL_HOST ??
                    'https://fusion-s-portal-ci.azurewebsites.net',
                configSourceFiles: {
                    app: opt.config,
                    manifest: opt.manifest,
                    vite: opt.vite,
                    widgetPath: opt.widgetPath,
                },
                widget: true,
                outputFileName: opt.outputFileName,
                library: opt.framework,
                port: opt.port,
                devPortalPath: devPortalPath,
            });
        });

    widget
        .command('build')
        .option('-o, --outDir, <string>', 'output directory of package', 'dist')
        .option(
            '-n, --outputFileName, <string>',
            'output file name of package, default widget-bundle',
            'widget-bundle',
        )
        .option(
            '-c, --config <string>',
            'Use specified config file, see https://vitejs.dev/guide/cli.html#build',
        )
        .option(
            '    --vite <string>',
            `use specified Vite config file, by default search for ${formatPath(
                'app.config.vite.{ts,js,json}',
            )}`,
        )
        .option(
            '-F, --framework <string>',
            `application framework to build the application on, supported: [${chalk.yellowBright(
                'react',
            )}]`,
            'react',
        )
        .action(async (opt) => {
            buildApplication({
                configSourceFiles: {
                    vite: opt.vite,
                },
                outputFileName: opt.outputFileName,
                outDir: opt.outDir,
            });
        });

    widget
        .command('pack')
        .option('-o, --outDir, <string>', 'output directory of package', 'dist')
        .option('-a, --archive, <string>', 'output filename', 'widget-bundle.zip')
        .option(
            '-n, --outFileName, <string>',
            'output file name of package, default widget-bundle',
            'widget-bundle',
        )
        .action(async (opt) => {
            const { outDir, archive, outputFileName } = opt;
            bundleWidget({ archive, outDir, outputFileName });
        });
};
