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

export {
    mergeWidgetManifests,
    defineWidgetManifest,
    createWidgetManifest,
    type WidgetManifest,
    type WidgetManifestFn,
} from './widget-manifest.js';

export {
    mergeWidgetConfigs,
    defineWidgetConfig,
    type WidgetConfig,
    type WidgetConfigFn,
    type WidgetConfigExport,
} from './widget-config.js';

export { createDevConfig, type AppConfig as ProxyConfig } from './dev-config.js';
