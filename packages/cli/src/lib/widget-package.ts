import {
    PackageJson,
    readPackageUp,
    type NormalizeOptions as ResolveAppPackageOptions,
} from 'read-package-up';

import { assert } from './utils/assert.js';
import { WidgetManifest } from './widget-manifest.js';

export type WidgetPackageJson = PackageJson & {
    manifest?: WidgetManifest;
};

type DefinePackageFn = () => WidgetPackageJson | Promise<WidgetPackageJson>;
type DefinePackageExporter = WidgetPackageJson | DefinePackageFn;

export interface defineAppPackage {
    (obj: WidgetPackageJson): WidgetPackageJson;
}

export interface defineAppPackage {
    (fn: DefinePackageFn): void;
}

export type ResolvedWidgetPackage = {
    packageJson: WidgetPackageJson;
    path: string;
};

export function defineWidgetPackage(fnOrObject: DefinePackageExporter): DefinePackageExporter {
    return fnOrObject;
}

export const resolveWidgetEntryPoint = (packageJson: Pick<PackageJson, 'main' | 'module'>) => {
    const { main: entry = packageJson.module } = packageJson;
    assert(entry, 'expected [main|module] in packageJson');
    return entry;
};

export const resolveWidgetKey = (packageJson: Pick<PackageJson, 'name'>) => {
    assert(packageJson.name, 'expected [name] in packageJson');
    return packageJson.name.replace(/^@|\w.*\//gm, '');
};

// TODO validate package json
export const assertPackage = (_pkg: Partial<WidgetPackageJson>) => {};

export const resolveWidgetPackage = async (
    options?: ResolveAppPackageOptions,
): Promise<ResolvedWidgetPackage> => {
    const result = await readPackageUp(options);
    if (!result) {
        throw Error('failed to find package.json');
    }
    return result;
};

export default resolveWidgetPackage;
