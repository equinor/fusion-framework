import tsc, { type CompilerOptions } from 'typescript';
import { dirname, join, resolve } from 'node:path';
import { readPackageUp } from 'read-pkg-up';
import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { fileExists } from './file-exists.js';

export const transpile = async (file: string) => {
    const pkg = await readPackageUp();
    assert(pkg, `failed to resolve bundle package`);

    const pkgRoot = dirname(pkg.path);

    const sourceFile = resolve(pkgRoot, file);
    assert(sourceFile, `failed to resolve ${file}`);

    const cacheDir = join(pkgRoot, 'node_modules', '.cache', 'ffc');

    const targetFile = join(cacheDir, file.replace(pkgRoot, '').replace(/.ts$/, '.mjs'));

    if (await fileExists(targetFile)) {
        const sourceTouch = (await stat(sourceFile)).mtime;
        const targetTouch = (await stat(targetFile)).mtime;
        if (sourceTouch < targetTouch) {
            return targetFile;
        }
    }

    if (!existsSync(dirname(targetFile))) {
        await mkdir(cacheDir, { recursive: true });
    }

    const compilerOptions = await loadCompilerOptions('tsconfig.json');

    const tsContent = (await readFile(sourceFile)).toString();
    const jsContent = tsc.transpileModule(tsContent, { compilerOptions }).outputText;

    assert(jsContent, `failed to transpile [${file}]`);

    await writeFile(targetFile, jsContent);
    return targetFile;
};

const loadCompilerOptions = (filename: string): Promise<CompilerOptions> => {
    const config = tsc.readConfigFile(filename, tsc.sys.readFile).config;
    if (config.extends) {
        const extended = resolve(config.extends);
        return {
            ...loadCompilerOptions(extended),
            ...config.compilerOptions,
        };
    }
    return config.compilerOptions;
};

export default transpile;
