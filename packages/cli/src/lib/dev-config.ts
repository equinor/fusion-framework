import { type Express } from 'express';
import loadConfig, { ConfigExecuterEnv } from './utils/config.js';
import { fileExistsSync } from './utils/file-exists.js';
import { WidgetConfig } from './widget-manifest.js';

export type AppConfig = {
    express?(app: Express): void;
    widgets?: WidgetConfig[];
};

export const filename = 'dev.config.ts';

export const loadAppConfig = (fileName: string) => loadConfig<AppConfig>(fileName);

export const getProxyConfigFilePath = (root?: string) => [root, filename].join('/');

export const proxyFileExist = (root?: string) =>
    root ? fileExistsSync(getProxyConfigFilePath(root)) : false;

export const defineProxyConfig = (fn: (env: ConfigExecuterEnv, app: Express) => void) => fn;

export const createDevConfig = (fn: (env: ConfigExecuterEnv) => AppConfig) => fn;
