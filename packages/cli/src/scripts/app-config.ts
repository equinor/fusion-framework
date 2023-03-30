import path from 'path';
import fs from 'fs';
import url from 'url';

import { findUpSync } from 'find-up';

const supportedTypes = ['js', 'json'] as const;
type SupportedTyped = (typeof supportedTypes)[number];

type PackageInfo = {
    version: string;
    name: string;
    main: string;
};

type AppConfig = {
    manifest?: {
        key?: string;
    };
    environment?: Record<string, unknown>;
    endpoints?: Record<string, string>;
    portalHost?: string;
};

type ConfigSource = {
    type: SupportedTyped;
    file: string;
};

type LocalConfig = AppConfig & {
    configSource?: ConfigSource;
    pkg: any; // package.json
    root: any; // project root
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
    const path = url.pathToFileURL(file);
    return (await import(path)).default();
};

const loadConfigFromJson = async (file: string): Promise<AppConfig> => {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
};

export const loadConfig = async (
    path: string
): Promise<AppConfig & { configSource?: ConfigSource }> => {
    const configSource = getConfigType(path);
    const customConfig = await (() => {
        switch (configSource?.type) {
            case 'js':
                return loadConfigFromJavascript(configSource.file);
            case 'json':
                return loadConfigFromJson(configSource.file);
            default:
                return Promise.resolve({} as AppConfig);
        }
    })();
    return { ...customConfig, configSource };
};

const validateConfig = (config: { main: string }): void => {
    if (!config.main) {
        throw Error('missing `main` entry in package.json');
    }
};

export const resolveAppConfig = async (): Promise<LocalConfig> => {
    const { root, pkg } = resolvePackage();

    const appConfig = await loadConfig(root);

    const manifest = Object.assign(
        {
            key: pkg.name.replace(/^@|\w.*\//gm, ''),
        },
        appConfig.manifest,
        {
            version: pkg.version,
            name: pkg.name,
            main: pkg.main,
            __DEV__: { root, configSource: appConfig.configSource, portal: appConfig.portalHost },
        }
    );

    validateConfig(manifest);

    return { ...appConfig, manifest, pkg, root };
};
