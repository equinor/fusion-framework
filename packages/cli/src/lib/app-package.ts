import { existsSync } from 'node:fs';
import { dirname, relative } from 'node:path';

import {
    PackageJson,
    readPackageUp,
    type NormalizeOptions as ResolveAppPackageOptions,
} from 'read-package-up';

import { AppManifest } from '@equinor/fusion-framework-module-app';
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

/**
 * Resolves the entry point of a given package.
 *
 * This function attempts to find the entry point of a package by checking several
 * common properties in the package's `package.json` file, such as `entrypoint`, `main`,
 * and `module`. If none of these properties are found, it defaults to checking for
 * common entry files like `src/index.ts`, `src/index.tsx`, `src/index.js`, and `src/index.jsx`.
 *
 * @param pkg - The resolved application package containing the package.json and path information.
 * @returns The relative path to the resolved entry point.
 * @throws Will throw an error if no entry point can be resolved.
 */
export const resolveEntryPoint = (packageJson: PackageJson, pkgPath: string = ''): string => {
    const entrypoint = [
        packageJson.entrypoint,
        packageJson.main,
        packageJson.module,
        'src/index.ts',
        'src/index.tsx',
        'src/index.js',
        'src/index.jsx',
    ]
        .filter((x): x is string => !!x)
        .map((x): string => relative(dirname(pkgPath), x))
        .find((entry) => existsSync(entry));

    assert(entrypoint, 'failed to resolve entrypoint');

    return entrypoint;
};

/**
 * Resolves the application key from the given package.json object.
 *
 * @param packageJson - An object containing the 'name' property from the package.json.
 * @returns The resolved application key, which is the package name with any leading '@' or scope removed.
 * @throws Will throw an error if the 'name' property is not present in the packageJson.
 */
export const resolveAppKey = (packageJson: Pick<PackageJson, 'name'>) => {
    assert(packageJson.name, 'expected [name] in packageJson');
    return packageJson.name.replace(/^@|\w.*\//gm, '');
};

/**
 * Asserts the validity of a given package by resolving its application key and entry point.
 *
 * @param pkg - A partial representation of the application's package JSON.
 */
export const assertPackage = (pkg: Partial<AppPackageJson>) => {
    assert(resolveAppKey(pkg));
    assert(resolveEntryPoint(pkg as AppPackageJson));
};

/**
 * Resolves the application package by searching for the nearest `package.json` file.
 *
 * @param options - Optional parameters to customize the search behavior.
 * @returns A promise that resolves to the found package information.
 * @throws Will throw an error if the `package.json` file is not found.
 */
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
