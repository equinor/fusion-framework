#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = resolve(__dirname, '..');
const cliEntry = resolve(packageRoot, 'dist/esm/cli.js');

const [mode = 'cli', ...rest] = process.argv.slice(2);
const separatorIndex = rest.indexOf('--');
const cliArgs = separatorIndex >= 0 ? rest.slice(separatorIndex + 1) : rest;

const env = { ...process.env };

switch (mode) {
  case 'cli': {
    delete env.FUSION_AI_STUDIO_EXECUTOR;
    delete env.FUSION_AI_STUDIO_SDK_ADAPTER;
    break;
  }
  case 'sdk-mock': {
    env.FUSION_AI_STUDIO_EXECUTOR = 'sdk';
    env.FUSION_AI_STUDIO_SDK_ADAPTER = 'mock';
    break;
  }
  case 'sdk-http': {
    env.FUSION_AI_STUDIO_EXECUTOR = 'sdk';
    env.FUSION_AI_STUDIO_SDK_ADAPTER = 'http';
    env.FUSION_AI_STUDIO_SDK_ENDPOINT ??= 'http://localhost:8799/sdk';
    break;
  }
  default: {
    console.error(`Unsupported ai-studio mode: ${mode}`);
    process.exit(1);
  }
}

const child = spawn(process.execPath, [cliEntry, ...cliArgs], {
  cwd: packageRoot,
  env,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
