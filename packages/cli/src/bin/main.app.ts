import { Command } from 'commander';

import { createDevServer } from './create-dev-serve.js';
import { buildApplication } from './build-application.js';
import { publishApplication } from './publish-application.js';
import { uploadApplication } from './upload-application.js';
import { tagApplication } from './tag-application.js';

import { formatPath, chalk } from './utils/format.js';
import { createAppManifest, createBuildManifest } from './create-export-manifest.js';
import { bundleApplication } from './bundle-application.js';
import { createExportConfig } from './create-export-config.js';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';

export default (program: Command) => {
    const app = program
        .command('app')
        .description('Tooling for developing applications build on Fusion Framework');

    app.command('dev')
        .description('Start development server for application')
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
                },
                library: opt.framework,
                port: opt.port,
                devPortalPath: devPortalPath,
            });
        });

    app.command('manifest')
        .description('Generate manifest')
        .option('-o, --output <string>', 'output file')
        .option('-c, --config <string>', 'manifest config file')
        .action((opt) => {
            createAppManifest({
                outputFile: opt.output,
                configFile: opt.config,
            });
        });

    app.command('build')
        .description('Builds application')
        .option('-o, --outDir, <string>', 'output directory of package', 'dist')
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
                outDir: opt.outDir,
            });
        });

    app.command('build-config')
        .description('Generate config')
        .option('-o, --output <string>', 'output file')
        .option('-c, --config <string>', 'application config file')
        .option(
            '-p, --publish <string>',
            `Publish app config to version [${chalk.yellowBright('(semver | current | latest | preview)')}]`,
        )
        .option(
            '-e, --env, <ci | fqa | tr | fprd>',
            'Fusion environment to build api urls from. used when publishing config.',
        )
        .option(
            '-s, --service, <string>',
            'Define uri to custom app service. You can also define the env variable CUSTOM_APPAPI to be used on all publish commands. the --env parameter is ignored when set',
        )
        .action((opt) => {
            createExportConfig({
                outputFile: opt.output,
                configFile: opt.config,
                publish: opt.publish,
                env: opt.env,
                service: opt.service,
            });
        });

    app.command('build-manifest')
        .description('Generate manifest')
        .option('-o, --output <string>', 'output file')
        .option('-c, --config <string>', 'manifest config file')
        .action((opt) => {
            createBuildManifest({
                outputFile: opt.output,
                configFile: opt.config,
            });
        });

    app.command('build-pack')
        .description('Create  distributable app bundle of the application')
        .option('-o, --outDir, <string>', 'output directory of package', 'dist')
        .option('-a, --archive, <string>', 'output filename', 'app-bundle.zip')
        .action(async (opt) => {
            const { outDir, archive } = opt;
            bundleApplication({ archive, outDir });
        });

    app.command('build-publish')
        .description('Publish application to app api')
        .option(
            '-t, --tag, <string>',
            `Tagname to publish this build as [${chalk.yellowBright('(latest | preview)')}]`,
            'latest',
        )
        .requiredOption(
            '-e, --env, <ci | fqa | tr | fprd>',
            'Fusion environment to build api urls from',
        )
        .option(
            '-s, --service, <string>',
            'Define uri to custom app service. You can also define the env variable CUSTOM_APPAPI to be used on all publish commands. the --env parameter is ignored when set',
        )
        .action(async (opt) => {
            const { tag, env, service } = opt;
            publishApplication({ tag, env, service });
        });

    app.command('build-upload')
        .description('Upload packaged app bundle to app api')
        .option(
            '-b, --bundle, <string>',
            'The packaged app bundle file to upload',
            'app-bundle.zip',
        )
        .requiredOption(
            '-e, --env, <ci | fqa | tr | fprd>',
            'Fusion environment to build api urls from',
        )
        .option(
            '-s, --service, <string>',
            'Define uri to custom app service. You can also define the env variable CUSTOM_APPAPI to be used on all publish commands. the --env parameter is ignored when set',
        )
        .action(async (opt) => {
            const { bundle, env, service } = opt;
            uploadApplication({ bundle, env, service });
        });

    app.command('build-tag')
        .description('Tag a published version')
        .option(
            '-t, --tag, <string>',
            `Tag the published version with tagname [${chalk.yellowBright('(latest | preview)')}]`,
            'latest',
        )
        .requiredOption(
            '-v, --version, <string>',
            'Version number to tag, must be a published version number',
        )
        .requiredOption(
            '-e, --env, <ci | fqa | tr | fprd>',
            'Fusion environment to build api urls from',
        )
        .option(
            '-s, --service, <string>',
            'Define uri to custom app service. You can also define the env variable CUSTOM_APPAPI to be used on all publish commands. the --env parameter is ignored when set',
        )
        .action(async (opt) => {
            const { tag, version, env, service } = opt;
            tagApplication({ tag, version, env, service });
        });
};
