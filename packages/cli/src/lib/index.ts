export {
    mergeManifests,
    defineAppManifest,
    type AppManifest,
    type AppManifestFn,
} from './app-manifest.js';

export {
    mergeAppConfigs,
    defineAppConfig,
    type AppConfig,
    type AppConfigFn,
    type AppConfigExport,
} from './app-config.js';

export {
    defineAppPackage,
    resolveAppKey,
    resolveEntryPoint,
    type AppPackageJson,
    type ResolvedAppPackage,
} from './app-package.js';
