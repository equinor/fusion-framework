import { loadEnv, type Plugin } from 'vite';
import { resolve } from 'node:path';

export const configureEnvironment: Plugin['config'] = (config, { mode }) => {
    const resolvedRoot = resolve(config.root || process.cwd());
    const envDir = config.envDir ? resolve(resolvedRoot, config.envDir) : resolvedRoot;
    const env = loadEnv(mode, envDir, 'FUSION_');

    console.log(env);
};
