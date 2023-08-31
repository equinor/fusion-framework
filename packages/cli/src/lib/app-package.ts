import {
    PackageJson,
    readPackageUp,
    type NormalizeOptions as ResolveAppPackageOptions,
} from 'read-pkg-up';

import { AppManifest } from './app-manifest.js';
import { assert } from './utils/assert.js';

export type AppPackageJson = PackageJson & {
    manifest?: AppManifest;
};

type DefinePackageFn = () => AppPackageJson | Promise<AppPackageJson>;
type DefinePackageExporter = AppPackageJson | DefinePackageFn;

export interface defineAppPackage {
    (obj: AppPackageJson): AppPackageJson;
}

export interface defineAppPackage {
    (fn: DefinePackageFn): void;
}

export type ResolvedAppPackage = {
    packageJson: AppPackageJson;
    path: string;
};

export function defineAppPackage(fnOrObject: DefinePackageExporter): DefinePackageExporter {
    return fnOrObject;
}

export const resolveEntryPoint = (packageJson: Pick<PackageJson, 'main' | 'module'>) => {
    const { main: entry = packageJson.module } = packageJson;
    assert(entry, 'expected [main|module] in packageJson');
    return entry;
};

export const resolveAppKey = (packageJson: Pick<PackageJson, 'name'>) => {
    assert(packageJson.name, 'expected [name] in packageJson');
    return packageJson.name.replace(/^@|\w.*\//gm, '');
};

// TODO validate package json
export const assertPackage = (_pkg: Partial<AppPackageJson>) => {};

export const resolveAppPackage = async (
    options?: ResolveAppPackageOptions,
): Promise<ResolvedAppPackage> => {
    const result = await readPackageUp(options);
    if (!result) {
        throw Error('failed to find package.json');
    }
    return result;
};

export default resolveAppPackage;
