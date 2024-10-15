export { mergeManifests, defineAppManifest, type AppManifestFn } from './app-manifest.js';

export { defineAppConfig, type AppConfigFn, type AppConfigExport } from './app-config.js';

export {
    defineAppPackage,
    resolveAppKey,
    resolveEntryPoint,
    type AppPackageJson,
    type ResolvedAppPackage,
} from './app-package.js';
