import tsc, { type CompilerOptions } from 'typescript';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { readPackageUp } from 'read-pkg-up';
import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { fileExists } from './file-exists.js';

export const load = async (file: string) => {
    const pkg = await readPackageUp();
    assert(pkg, `failed to resolve bundle package`);

    const pkgRoot = dirname(pkg.path);

    const sourceFile = resolve(pkgRoot, file);
    assert(sourceFile, `failed to resolve ${file}`);

    const cacheDir = join(pkgRoot, 'node_modules', '.cache', 'fusion-framework-cli');

    const targetFile = join(cacheDir, file.replace(/.ts$/, '.mjs'));

    console.debug('target file');
    console.debug(targetFile);

    if (await fileExists(targetFile)) {
        const sourceTouch = (await stat(sourceFile)).mtime;
        const targetTouch = (await stat(targetFile)).mtime;
        if (sourceTouch < targetTouch) {
            console.debug('found cache entry');
            return import(targetFile);
        } else {
            console.debug('cache expired');
        }
    }

    if (!existsSync(dirname(targetFile))) {
        console.debug('creating local cache dir');
        await mkdir(cacheDir, { recursive: true });
    }

    const compilerOptions = await loadCompilerOptions('tsconfig.json');

    const tsContent = (await readFile(sourceFile)).toString();
    const jsContent = tsc.transpileModule(tsContent, { compilerOptions }).outputText;

    assert(jsContent, `failed to transpile [${file}]`);

    await writeFile(targetFile, jsContent);
    return import(targetFile);
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

load('app.manifest.config.ts').then((e) => {
    console.log(e.default(undefined, {}));
});
