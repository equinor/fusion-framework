---
"@equinor/fusion-framework": patch
"@equinor/fusion-framework-app": patch
"@equinor/fusion-framework-dev-portal": patch
"@equinor/fusion-framework-module-ag-grid": patch
"@equinor/fusion-framework-module-app": patch
"@equinor/fusion-framework-module-bookmark": patch
"@equinor/fusion-framework-module-context": patch
"@equinor/fusion-framework-module-event": patch
"@equinor/fusion-framework-module-feature-flag": patch
"@equinor/fusion-framework-module-msal": patch
"@equinor/fusion-framework-module-navigation": patch
"@equinor/fusion-framework-module-service-discovery": patch
"@equinor/fusion-framework-module-services": patch
"@equinor/fusion-framework-module-signalr": patch
"@equinor/fusion-framework-module-telemetry": patch
"@equinor/fusion-framework-module-widget": patch
"@equinor/fusion-framework-plugin-context-navigation": patch
"@equinor/fusion-framework-react": patch
"@equinor/fusion-framework-react-ag-charts": patch
"@equinor/fusion-framework-react-ag-grid": patch
"@equinor/fusion-framework-react-components-bookmark": patch
"@equinor/fusion-framework-react-components-people-provider": patch
"@equinor/fusion-framework-react-components-roles": patch
"@equinor/fusion-framework-react-module-bookmark": patch
"@equinor/fusion-framework-react-module-context": patch
"@equinor/fusion-framework-react-module-event": patch
"@equinor/fusion-framework-react-module-signalr": patch
"@equinor/fusion-framework-vitest-plugin-react-app": patch
"@equinor/fusion-framework-widget": patch
"@equinor/fusion-load-env": patch
"@equinor/fusion-query": patch
"@equinor/fusion-services": patch
---

Publish spec-compliant ESM that loads under native Node, not only through a bundler.

Every package now declares `"type": "module"`, and every relative import in the emitted `dist/esm` carries an explicit `.js` extension. Previously, tools that hand dependencies to Node's ESM resolver — such as Vitest with externalized dependencies — failed with `ERR_MODULE_NOT_FOUND` on imports like `./FrameworkConfigurator`. Consumers can remove the `server.deps.inline: [/@equinor\/fusion-framework/]` Vitest workaround once on these versions.

Bundled builds are unaffected; Vite, webpack, and Rollup resolve the explicit extensions as before.

Ref: https://github.com/equinor/fusion/issues/959
