import path from 'path';
import fs from 'fs';

import { findUpSync } from 'find-up';

const supportedTypes = ['js', 'json'] as const;
type SupportedTyped = (typeof supportedTypes)[number];

type LocalConfig = {
    manifest?: {
        key: string;
    };
    environment?: Record<string, unknown>;
    endpoints?: Record<string, string>;
    configSource?: {
        type: SupportedTyped;
        file: string;
    };
};

type PackageInfo = {
    version: string;
    name: string;
    main: string;
};

type AppConfig = {
    key?: string;
    environment?: Record<string, unknown>;
    endpoints?: Record<string, string>;
};

export const resolvePackageRoot = () => {
    const pkgFile = findUpSync('package.json');
    if (!pkgFile) {
        throw Error('failed to resolve package');
    }
    return pkgFile;
};

export const resolvePackage = (): { root: string; pkg: PackageInfo } => {
    const pkgFile = resolvePackageRoot();
    const pkgRaw = fs.readFileSync(pkgFile, 'utf8');
    return { root: path.dirname(pkgFile), pkg: JSON.parse(pkgRaw) };
};

export const getConfigType = (root: string): { type: SupportedTyped; file: string } | undefined => {
    const base = path.join(root, 'app.config');
    return supportedTypes
        .map((type) => ({ type, file: [base, type].join('.') }))
        .find((x) => fs.existsSync(x.file) && fs.statSync(x.file).isFile());
};

const loadConfigFromJavascript = async (file: string): Promise<AppConfig> => {
    return (await import(file)).default();
};

const loadConfigFromJson = async (file: string): Promise<AppConfig> => {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
};

export const loadConfig = async (root: string): Promise<LocalConfig> => {
    const resolved = getConfigType(root);
    const { environment, endpoints, ...manifest } = await (() => {
        switch (resolved?.type) {
            case 'js':
                return loadConfigFromJavascript(resolved.file);
            case 'json':
                return loadConfigFromJson(resolved.file);
            default:
                return Promise.resolve({} as AppConfig);
        }
    })();
    return { ...manifest, environment, endpoints, configSource: resolved };
};

const validateConfig = (config: { main: string }): void => {
    if (!config.main) {
        throw Error('missing `main` entry in package.json');
    }
};

export const resolveAppConfig = async (): Promise<{
    manifest: PackageInfo & LocalConfig;
    dev: {
        root: string;
    } & LocalConfig;
}> => {
    const { root, pkg } = resolvePackage();

    const { configSource, ...localConfig } = await loadConfig(root);
    const dev = { root, configSource };

    const manifest = Object.assign(
        {
            key: pkg.name.replace(/^@|\w.*\//gm, ''),
        },
        localConfig.manifest,
        {
            version: pkg.version,
            name: pkg.name,
            main: pkg.main,
            __DEV__: dev,
        }
    );

    validateConfig(manifest);

    return { ...localConfig, manifest, dev };
};
