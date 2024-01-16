import { Command } from 'commander';

import { createDevServer } from './create-dev-serve.js';

import { chalk } from './utils/format.js';
import { join } from 'node:path';

export default (program: Command) => {
    const app = program
        .command('portal')
        .description('Tooling for developing applications build on Fusion Framework');

    app.command('dev')
        .description('Create a development server')
        .option('-p, --port <number>', 'dev-server port')
        .option('-P, --portal <string>', 'fusion portal host')
        .option(
            '-F, --framework <string>',
            `application framework to build the application on, supported: [${chalk.yellowBright(
                'react',
            )}]`,
            'react',
        )
        .option('-d, --dev-portal <string>', 'Location of dev-portal you want to use', 'src')
        .action(async (opt) => {
            const devPortalPath = join(process.cwd(), opt.devPortal);
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
                devPortal: {path: devPortalPath, static: false},
            });
        });
};
