import { Command } from 'commander';

import { createDevServer } from './create-dev-serve.js';
import { buildApplication } from './build-application.js';

import { formatPath, chalk } from './utils/format.js';
import createExportManifest from './create-export-manifest.js';
import { bundleApplication } from './bundle-application.js';
import { createExportConfig } from './create-export-config.js';

export default (program: Command) => {
    const app = program
        .command('app')
        .description('Tooling for developing applications build on Fusion Framework');

    app.command('dev')
        .description('Create a development server')
        .option('-p, --port <number>', 'dev-server port')
        .option('-P, --portal <string>', 'fusion portal host')
        .option(
            '-c, --config <file>',
            `use specified application config, by default search for ${formatPath(
                'app.config.{ts,js,json}',
            )}`,
        )
        .option(
            '    --manifest <file>',
            `use specified manifest, by default search for ${formatPath(
                'app.manifest.{ts,js,json}',
            )}`,
        )
        .option(
            '    --vite <file>',
            `use specified Vite config file, by default search for ${formatPath(
                'app.vite.{ts,js,json}',
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
            await createDevServer({
                portal:
                    process.env.FUSION_PORTAL_HOST ??
                    'https://fusion-s-portal-ci.azurewebsites.net',
                configSourceFiles: {
                    app: opt.config,
                    manifest: opt.manifest,
                    vite: opt.vite,
                },
                library: opt.framework,
                port: opt.port,
            });
        });

    app.command('build')
        .option('-o, --outDir, <string>', 'output directory of package', 'dist')
        .option(
            '-c, --config <string>',
            'Use specified config file, see https://vitejs.dev/guide/cli.html#build',
        )
        .option(
            '    --vite <string>',
            `use specified Vite config file, by default search for ${formatPath(
                'app.vite.{ts,js,json}',
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
                outDir: opt.outDir,
            });
        });

    app.command('config')
        .option('-o, --output <string>', 'output file')
        .option('-c, --config <string>', 'application config file')
        .action((opt) => {
            createExportConfig({
                outputFile: opt.output,
                configFile: opt.config,
            });
        });
    app.command('manifest')
        .option('-o, --output <string>', 'output file')
        .option('-c, --config <string>', 'manifest config file')
        .action((opt) => {
            createExportManifest({
                outputFile: opt.output,
                configFile: opt.config,
            });
        });

    app.command('pack')
        .option('-o, --outDir, <string>', 'output directory of package', 'dist')
        .action(async (opt) => {
            bundleApplication({ archive: 'app.bundle.zip', outDir: opt.outDir });
        });
};
