#!/usr/bin/env node

import { Command } from 'commander';

import ora from 'ora';

import { build, mergeConfig, UserConfig } from 'vite';

import startDevServer from './serve.js';
import { createConfig, loadCustomConfig } from './create-config.js';
import { resolveAppConfig } from './app-config.js';

const program = new Command();

program.name('fusion-framework-cli');
program.description('CLI for Fusion Framework');
program.version('0.0.1-alpha');

const app = program
    .command('app')
    .description('Tooling for developing applications build on Fusion Framework');

app.command('dev')
    .description('Create a development server')

    .option('-p, --port <number>', 'dev-server port', '3000')
    .option('--portal <string>', 'fusion portal host')
    .option(
        '-c, --config <file>',
        'Use specified config file, see https://vitejs.dev/guide/cli.html#build'
    )
    .action(async ({ port, portal, config }) => {
        const spinner = ora('Loading configuration').start();
        const customConfig = config ? await loadCustomConfig(config) : {};
        const viteConfig = mergeConfig(await createConfig(), {
            ...customConfig,
            server: { port },
        }) as UserConfig;
        const appConfig = await resolveAppConfig();

        appConfig.portalHost = portal
            ? portal
            : process.env.FUSION_PORTAL_HOST ?? 'https://fusion-s-portal-ci.azurewebsites.net';

        spinner.succeed('Configuration loaded');
        startDevServer({ viteConfig, appConfig });
    });

app.command('build')
    .option(
        '-c, --config <file>',
        'Use specified config file, see https://vitejs.dev/guide/cli.html#build'
    )
    .action(async ({ config }) => {
        const spinner = ora('Loading configuration').start();
        const customConfig = config ? await loadCustomConfig(config) : {};
        const viteConfig = mergeConfig(await createConfig({ mode: 'production' }), {
            build: { emptyOutDir: true },
            ...customConfig,
        });
        spinner.succeed('Configuration loaded');
        build(viteConfig);
    });

program.parse();
