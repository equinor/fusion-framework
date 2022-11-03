import { createServer } from 'vite';
import type { UserConfig } from 'vite';

import express from 'express';

import dns from 'dns';
dns.setDefaultResultOrder('verbatim');

import path from 'path';
import kleur from 'kleur';

import ora from 'ora';

const resolveRelativePath = (relative: string) =>
    path.resolve(new URL(relative, import.meta.url).pathname);

export const server = async (config: UserConfig) => {
    const spinner = ora('Starting dev-server').start();
    const app = express();

    const port = config.server?.port ?? 3000;

    const vite = await createServer(config);

    app.use(vite.middlewares);
    app.use(express.static(resolveRelativePath('dev-portal')));
    app.use('*', async (_, res) => {
        res.sendFile(resolveRelativePath('dev-portal/index.html'));
    });

    app.listen(port);

    spinner.succeed(
        `dev-server started on: ${kleur.underline().green(['http://localhost', port].join(':'))}`
    );
};

export default server;
