#!/usr/bin/env node

import { Command } from 'commander';

import ora from 'ora';

import { build, mergeConfig } from 'vite';

import startDevServer from './serve.js';
import createConfig from './create-config.js';

const program = new Command();

program.name('fusion-framework-cli');
program.description('CLI for Fusion Framework');
program.version('0.0.1-alpha');

const app = program
    .command('app')
    .description('Tooling for developing applications build on Fusion Framework');

app.command('dev')
    .description('Create a development server')

    .option('-p, --port <number>', 'devserver port', '3000')
    .action(async (port: number) => {
        const spinner = ora('Loading configuration').start();
        const config = mergeConfig(await createConfig(), { server: port });
        spinner.succeed('Configuration loaded');
        startDevServer(mergeConfig(config, { server: port }));
    });

app.command('build').action(() => {
    build();
});

program.parse();
